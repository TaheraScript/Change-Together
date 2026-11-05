import { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import {
  ApiError,
  getEvent,
  getUpcomingEvents,
  isUpcoming,
  toDateInputValue,
  type CreateEventInput,
  type EventRecord,
} from "./events";

export const EVENTS_COLLECTION = "create-event";
export const JOINS_COLLECTION = "event-joins";

const JOIN_INDEX_NAME = "unique_event_user";

type StoredDoc = { _id: string | ObjectId; [key: string]: unknown };

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function toDateString(value: unknown): string {
  if (value instanceof Date) return toDateInputValue(value);
  if (typeof value === "string") return value.slice(0, 10);
  return "";
}

export function normalizeEvent(doc: Record<string, unknown>): EventRecord {
  return {
    _id: String(doc._id ?? ""),
    title: toText(doc.title),
    description: toText(doc.description),
    type: toText(doc.type) || "Community Support",
    thumbnailUrl: toText(doc.thumbnailUrl),
    location: toText(doc.location),
    date: toDateString(doc.date),
    organizerEmail: toText(doc.organizerEmail),
    createdAt:
      doc.createdAt instanceof Date
        ? doc.createdAt.toISOString()
        : typeof doc.createdAt === "string"
          ? doc.createdAt
          : undefined,
    joinCount: typeof doc.joinCount === "number" ? doc.joinCount : undefined,
  };
}

function idFilter(id: string) {
  const candidates: (string | ObjectId)[] = [id];
  if (ObjectId.isValid(id)) candidates.push(new ObjectId(id));
  return { _id: { $in: candidates } };
}

async function findEventInDb(id: string): Promise<EventRecord | null> {
  try {
    const db = await getDb();
    const doc = await db
      .collection<StoredDoc>(EVENTS_COLLECTION)
      .findOne(idFilter(id));
    return doc ? normalizeEvent(doc) : null;
  } catch (error) {
    console.error("[events] Mongo lookup failed:", error);
    return null;
  }
}

export function findEventInMongo(id: string): Promise<EventRecord | null> {
  return findEventInDb(id);
}

export type EventLookup =
  | { status: "ok"; event: EventRecord }
  | { status: "missing" }
  | { status: "unavailable" };

export async function lookupEvent(
  id: string,
  options: { token?: string | null } = {},
): Promise<EventLookup> {
  const fromDb = await findEventInDb(id);
  if (fromDb) return { status: "ok", event: fromDb };

  const headers = options.token
    ? { authorization: `Bearer ${options.token}` }
    : undefined;

  try {
    return {
      status: "ok",
      event: await getEvent(id, headers ? { headers } : undefined),
    };
  } catch (error) {
    if (
      error instanceof ApiError &&
      (error.status === 404 || error.status === 400)
    ) {
      return { status: "missing" };
    }
    return { status: "unavailable" };
  }
}

export async function findUpcomingInDb(limit?: number): Promise<EventRecord[]> {
  const db = await getDb();
  const today = toDateInputValue(new Date());

  let cursor = db
    .collection<StoredDoc>(EVENTS_COLLECTION)
    .find({
      $or: [
        { date: { $gte: today } },
        { date: { $gte: new Date(`${today}T00:00:00.000Z`) } },
      ],
    })
    .sort({ date: 1 });

  if (limit) cursor = cursor.limit(limit);

  const docs = await cursor.toArray();
  return docs.map((doc) => normalizeEvent(doc as Record<string, unknown>));
}

export async function listUpcomingEvents(): Promise<EventRecord[]> {
  try {
    const events = await findUpcomingInDb();
    if (events.length > 0) return events;
  } catch (error) {
    console.error("[events] Mongo query failed:", error);
  }

  const events = await getUpcomingEvents();
  return events
    .filter((event) => isUpcoming(event.date))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export const EDITABLE_EVENT_FIELDS = [
  "title",
  "description",
  "type",
  "thumbnailUrl",
  "location",
  "date",
] as const;

export type EventUpdate = Partial<
  Record<(typeof EDITABLE_EVENT_FIELDS)[number], string>
>;

function toStoredUpdate(update: EventUpdate): Record<string, string> {
  const result: Record<string, string> = {};
  for (const field of EDITABLE_EVENT_FIELDS) {
    const value = update[field];
    if (typeof value === "string") result[field] = value.trim();
  }
  return result;
}

export async function createEventInDb(
  input: CreateEventInput,
): Promise<EventRecord> {
  const db = await getDb();
  const document: StoredDoc = {
    _id: new ObjectId().toHexString(),
    title: input.title.trim(),
    description: input.description.trim(),
    type: input.type,
    thumbnailUrl: input.thumbnailUrl.trim(),
    location: input.location.trim(),
    date: input.date,
    organizerEmail: normalizeEmail(input.organizerEmail),
    createdAt: new Date(),
  };

  await db.collection<StoredDoc>(EVENTS_COLLECTION).insertOne(document);
  return normalizeEvent(document);
}

export async function updateEventInDb(
  id: string,
  update: EventUpdate,
): Promise<EventRecord | null> {
  const changes = toStoredUpdate(update);
  if (Object.keys(changes).length === 0) return findEventInDb(id);

  const db = await getDb();
  const result = await db
    .collection<StoredDoc>(EVENTS_COLLECTION)
    .updateOne(idFilter(id), { $set: changes });

  if (result.matchedCount === 0) return null;
  return findEventInDb(id);
}

export async function deleteEventInDb(id: string): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .collection<StoredDoc>(EVENTS_COLLECTION)
    .deleteOne(idFilter(id));

  if (result.deletedCount === 0) return false;

  await db.collection<StoredDoc>(JOINS_COLLECTION).deleteMany({ eventId: id });
  return true;
}

export async function listEventsByOrganizer(
  email: string,
): Promise<EventRecord[]> {
  const db = await getDb();
  const escaped = normalizeEmail(email).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  const docs = await db
    .collection<StoredDoc>(EVENTS_COLLECTION)
    .find({ organizerEmail: { $regex: `^${escaped}$`, $options: "i" } })
    .sort({ date: 1 })
    .toArray();

  return docs.map((doc) => normalizeEvent(doc));
}

export type JoinUserRecord = {
  email: string;
  displayName: string;
  photoURL: string | null;
};

export type JoinRecord = {
  event: EventRecord;
  joinedAt: string;
};

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase();
}

let joinIndexPromise: Promise<unknown> | null = null;

function ensureJoinIndex(): Promise<unknown> {
  if (!joinIndexPromise) {
    joinIndexPromise = getDb()
      .then((db) =>
        db
          .collection<StoredDoc>(JOINS_COLLECTION)
          .createIndex(
            { eventId: 1, "user.email": 1 },
            { unique: true, name: JOIN_INDEX_NAME },
          ),
      )
      .catch((error) => {
        joinIndexPromise = null;
        console.error("[event-joins] could not ensure unique index:", error);
      });
  }
  return joinIndexPromise;
}

export async function countJoins(eventId: string): Promise<number> {
  const db = await getDb();
  return db.collection<StoredDoc>(JOINS_COLLECTION).countDocuments({ eventId });
}

export async function findJoin(
  eventId: string,
  email: string,
): Promise<JoinRecord | null> {
  const db = await getDb();
  const doc = await db
    .collection<StoredDoc>(JOINS_COLLECTION)
    .findOne({ eventId, "user.email": normalizeEmail(email) });

  if (!doc) return null;
  return {
    event: normalizeEvent((doc.event ?? {}) as Record<string, unknown>),
    joinedAt: String(doc.joinedAt ?? ""),
  };
}

function isDuplicateKeyError(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    (error as { code?: number }).code === 11000
  );
}

export async function joinEventInDb(
  event: EventRecord,
  user: JoinUserRecord,
): Promise<{ joinedAt: string; created: boolean }> {
  await ensureJoinIndex();

  const db = await getDb();
  const collection = db.collection<StoredDoc>(JOINS_COLLECTION);
  const eventId = String(event._id);
  const email = normalizeEmail(user.email);

  const existing = await collection.findOne({ eventId, "user.email": email });
  if (existing) {
    return { joinedAt: String(existing.joinedAt ?? ""), created: false };
  }

  const document = {
    _id: new ObjectId().toHexString(),
    eventId,
    user: {
      email,
      displayName: user.displayName,
      photoURL: user.photoURL ?? null,
    },
    event: {
      _id: eventId,
      title: event.title,
      description: event.description,
      type: event.type,
      thumbnailUrl: event.thumbnailUrl,
      location: event.location,
      date: event.date,
      organizerEmail: event.organizerEmail ?? null,
    },
    joinedAt: new Date().toISOString(),
  };

  try {
    await collection.insertOne(document);
  } catch (error) {
    if (!isDuplicateKeyError(error)) throw error;
  }

  return { joinedAt: document.joinedAt, created: true };
}

export async function leaveEventInDb(
  eventId: string,
  email: string,
): Promise<boolean> {
  const db = await getDb();
  const result = await db
    .collection<StoredDoc>(JOINS_COLLECTION)
    .deleteOne({ eventId, "user.email": normalizeEmail(email) });

  return result.deletedCount > 0;
}

export async function listJoinsByEmail(email: string): Promise<JoinRecord[]> {
  const db = await getDb();
  const docs = await db
    .collection<StoredDoc>(JOINS_COLLECTION)
    .find({ "user.email": normalizeEmail(email) })
    .toArray();

  return docs
    .filter((doc) => doc.event && typeof doc.event === "object")
    .map((doc) => ({
      event: normalizeEvent(doc.event as Record<string, unknown>),
      joinedAt: String(doc.joinedAt ?? ""),
    }))
    .sort(
      (a, b) =>
        a.event.date.localeCompare(b.event.date) ||
        b.joinedAt.localeCompare(a.joinedAt),
    );
}
