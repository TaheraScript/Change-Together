export const EVENT_TYPES = [
  "Cleanup",
  "Plantation",
  "Donation",
  "Winter Relief",
  "Food Drive",
  "Health Camp",
  "Education",
  "Community Support",
] as const;

export type EventType = (typeof EVENT_TYPES)[number];

/** Shared limits so the forms and the API reject the same values. */
export const EVENT_LIMITS = {
  title: 120,
  location: 160,
  description: 700,
  thumbnailUrl: 2048,
} as const;

/**
 * Accepts an absolute http(s) URL or a path in this app (`/images/...`).
 * Every event needs a thumbnail, so an empty value is rejected.
 */
export function isValidEventImageUrl(value: string): boolean {
  const url = value.trim();
  if (!url) return false;
  if (url.length > EVENT_LIMITS.thumbnailUrl) return false;
  return /^https?:\/\/.+/i.test(url) || url.startsWith("/");
}

/**
 * What volunteers typically do at each kind of drive. The create form does
 * not collect this, so the details page derives a useful task list from the
 * event type instead of leaving the section empty.
 */
export const EVENT_VOLUNTEER_ACTIVITIES: Record<string, string[]> = {
  Cleanup: [
    "Join the on-ground clean-up crew",
    "Sort and bag the collected waste",
    "Hand out gloves, bags and safety gear",
    "Support the water and refreshment point",
  ],
  Plantation: [
    "Dig and prepare the planting pits",
    "Plant and water the new saplings",
    "Set up tree guards and labels",
    "Guide first-time volunteers",
  ],
  Donation: [
    "Receive and sort donated items",
    "Pack donation kits for families",
    "Keep the distribution queue moving",
    "Help recipients carry items home",
  ],
  "Winter Relief": [
    "Pack blankets and warm clothes",
    "Check sizes and clothing quality",
    "Distribute kits door to door",
    "Record recipient details",
  ],
  "Food Drive": [
    "Pack food parcels",
    "Serve hot meals",
    "Manage the serving line",
    "Clean up after distribution",
  ],
  "Health Camp": [
    "Welcome and register patients",
    "Guide visitors to the right counter",
    "Assist doctors and nurses",
    "Help with record keeping",
  ],
  Education: [
    "Run a reading or study circle",
    "Distribute books and stationery",
    "Support children with classwork",
    "Organise learning materials",
  ],
  "Community Support": [
    "Set up the venue and registration desk",
    "Welcome and register attendees",
    "Help with logistics and refreshments",
    "Pack up after the event",
  ],
};

const DEFAULT_VOLUNTEER_ACTIVITIES = [
  "Help set up the event",
  "Welcome and guide attendees",
  "Support the organiser with on-ground tasks",
  "Pack up after the event",
];

export function getVolunteerActivities(type: string): string[] {
  return EVENT_VOLUNTEER_ACTIVITIES[type] ?? DEFAULT_VOLUNTEER_ACTIVITIES;
}

export type EventRecord = {
  _id: string;
  title: string;
  description: string;
  type: EventType | string;
  thumbnailUrl: string;
  location: string;
  date: string; // YYYY-MM-DD
  organizerEmail: string;
  createdAt?: string;
  joinCount?: number;
};

export type CreateEventInput = {
  title: string;
  description: string;
  type: string;
  thumbnailUrl: string;
  location: string;
  date: string;
  organizerEmail: string;
};

export type JoinStatus = {
  joined: boolean;
  joinCount: number;
  joinedAt?: string | null;
};

export type JoinResponse = {
  joined: true;
  joinCount: number;
  joinedAt: string;
  alreadyJoined?: boolean;
};

export type JoinedEventRecord = {
  event: EventRecord;
  joinedAt: string;
};

// Must be a NEXT_PUBLIC_ variable because this file is used in client components.
export const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "").replace(
  /\/$/,
  "",
);

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

function extractMessage(payload: unknown): string {
  return payload &&
    typeof payload === "object" &&
    "message" in payload &&
    typeof payload.message === "string"
    ? payload.message
    : "Something went wrong. Please try again.";
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  if (!API_URL) {
    throw new ApiError(
      "The events service isn't configured. Set NEXT_PUBLIC_API_URL in .env.local and restart the server.",
      500,
    );
  }

  const hasBody = init?.body !== undefined && init?.body !== null;

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      // Only send Content-Type when there is a body, so plain GETs
      // don't trigger a CORS preflight.
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(extractMessage(payload), response.status);
  }

  return payload as T;
}

export function getUpcomingEvents(): Promise<EventRecord[]> {
  return apiRequest<EventRecord[]>("/upcoming-events");
}

/**
 * Same-origin request used for everything the Next app owns: ownership
 * checks, joins and the joined list. Unlike `apiRequest` it does not depend
 * on `NEXT_PUBLIC_API_URL`.
 */
async function internalRequest<T>(path: string, init: RequestInit = {}): Promise<T> {
  const hasBody = init.body !== undefined && init.body !== null;

  const response = await fetch(path, {
    ...init,
    cache: "no-store",
    headers: {
      ...(hasBody ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(extractMessage(payload), response.status);
  }

  return payload as T;
}

/** True when the signed-in volunteer created this event. */
export function isEventOwner(
  event: EventRecord,
  email: string | null | undefined,
): boolean {
  const owner = event.organizerEmail?.trim().toLowerCase();
  const me = email?.trim().toLowerCase();
  return Boolean(owner && me && owner === me);
}

export function getEvent(
  id: string,
  init?: RequestInit,
): Promise<EventRecord> {
  return apiRequest<EventRecord>(`/events/${encodeURIComponent(id)}`, init);
}

export function addEvent(input: CreateEventInput): Promise<EventRecord> {
  // Same-origin Mongo route: works even when the external events API is down.
  return internalRequest<{ insertedId: string; event: EventRecord }>(
    "/api/events",
    {
      method: "POST",
      body: JSON.stringify(input),
    },
  ).then((result) => result.event);
}

export function getJoinStatus(id: string): Promise<JoinStatus> {
  return internalRequest<JoinStatus>(`/api/events/${encodeURIComponent(id)}/join`);
}

export function joinEvent(id: string): Promise<JoinResponse> {
  return internalRequest<JoinResponse>(
    `/api/events/${encodeURIComponent(id)}/join`,
    { method: "POST" },
  );
}

/** Leave the event: deletes this user's join row. */
export function leaveEvent(id: string): Promise<JoinStatus> {
  return internalRequest<JoinStatus>(
    `/api/events/${encodeURIComponent(id)}/join`,
    { method: "DELETE" },
  );
}

export function getMyJoinedEvents(): Promise<JoinedEventRecord[]> {
  return internalRequest<JoinedEventRecord[]>("/api/my-events");
}

/** Events created by the signed-in volunteer (owner-scoped server-side). */
export function getMyEvents(): Promise<EventRecord[]> {
  return internalRequest<EventRecord[]>("/api/manage-events");
}

/** Upcoming events from this app's Mongo-backed route (no external API). */
export function getUpcomingEventsFromApp(): Promise<EventRecord[]> {
  return internalRequest<EventRecord[]>("/api/events");
}

export function updateEvent(
  id: string,
  input: Partial<CreateEventInput>,
): Promise<EventRecord> {
  return internalRequest<EventRecord>(`/api/events/${encodeURIComponent(id)}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function deleteEvent(id: string): Promise<{ deleted: boolean }> {
  return internalRequest<{ deleted: boolean }>(
    `/api/events/${encodeURIComponent(id)}`,
    { method: "DELETE" },
  );
}

export function formatEventDate(date: string): string {
  const parsed = new Date(`${date}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return date;
  return new Intl.DateTimeFormat("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function formatJoinedDate(value: string): string {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(parsed);
}

export function toDateInputValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function todayInputValue(): string {
  return toDateInputValue(new Date());
}

export function isUpcoming(date: string): boolean {
  return date >= todayInputValue();
}
