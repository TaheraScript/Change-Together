import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import {
  getUpcomingEvents,
  isUpcoming,
  toDateInputValue,
  type EventRecord,
} from "@/lib/events";

// Node runtime: the MongoDB driver cannot run on the edge.
export const runtime = "nodejs";
// Always hit the database so newly created events show up immediately.
export const dynamic = "force-dynamic";

/** Events created through /create-event land in this collection. */
const EVENTS_COLLECTION = "create-event";
/** The section asks for exactly six cards. */
const RECENT_LIMIT = 6;

function toDateString(value: unknown): string {
  if (value instanceof Date) return toDateInputValue(value);
  if (typeof value === "string") return value.slice(0, 10);
  return "";
}

function toText(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeEvent(doc: Record<string, unknown>): EventRecord {
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

/**
 * Six nearest upcoming events, straight from MongoDB.
 *
 * `date` is stored as a "YYYY-MM-DD" string, which sorts correctly as text, so
 * `$gte: today` plus `sort({ date: 1 })` plus `limit(6)` is enough. A Date
 * variant is also matched to stay safe if an older document stored a Date.
 */
async function readFromMongo(): Promise<EventRecord[]> {
  const db = await getDb();
  const today = toDateInputValue(new Date());

  const docs = await db
    .collection(EVENTS_COLLECTION)
    .find({
      $or: [
        { date: { $gte: today } },
        { date: { $gte: new Date(`${today}T00:00:00.000Z`) } },
      ],
    })
    .sort({ date: 1 })
    .limit(RECENT_LIMIT)
    .toArray();

  return docs.map((doc) => normalizeEvent(doc as Record<string, unknown>));
}

/** Fallback for setups where events still live in the external REST API. */
async function readFromRestApi(): Promise<EventRecord[]> {
  const events = await getUpcomingEvents();
  return events
    .filter((event) => isUpcoming(event.date))
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(0, RECENT_LIMIT);
}

export async function GET() {
  try {
    const events = await readFromMongo();
    if (events.length > 0) {
      return NextResponse.json({ events, source: "mongodb" });
    }
  } catch (error) {
    console.error("[recent-events] MongoDB query failed:", error);
  }

  try {
    const events = await readFromRestApi();
    return NextResponse.json({ events, source: "api" });
  } catch (error) {
    console.error("[recent-events] REST fallback failed:", error);
    // No backend and no database: let the UI render its empty state.
    return NextResponse.json({ events: [], source: "none" });
  }
}
