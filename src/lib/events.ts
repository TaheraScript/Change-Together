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
};

export type JoinUser = {
  email: string;
  displayName: string;
  photoURL?: string;
};

export type JoinedEventRecord = {
  event: EventRecord;
  joinedAt: string;
};

const API_URL = (
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000"
).replace(/\/$/, "");

export class ApiError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

  const payload: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      payload &&
      typeof payload === "object" &&
      "message" in payload &&
      typeof payload.message === "string"
        ? payload.message
        : "Something went wrong. Please try again.";
    throw new ApiError(message, response.status);
  }

  return payload as T;
}

export function getUpcomingEvents(): Promise<EventRecord[]> {
  return apiRequest<EventRecord[]>("/upcoming-events");
}

export function getEvent(id: string): Promise<EventRecord> {
  return apiRequest<EventRecord>(`/events/${encodeURIComponent(id)}`);
}

export function addEvent(input: CreateEventInput): Promise<EventRecord> {
  return apiRequest<{ insertedId: string; event: EventRecord }>("/create-event", {
    method: "POST",
    body: JSON.stringify(input),
  }).then((result) => result.event);
}

export function getJoinStatus(
  id: string,
  email: string,
): Promise<JoinStatus> {
  return apiRequest<JoinStatus>(
    `/events/${encodeURIComponent(id)}/join?email=${encodeURIComponent(email)}`,
  );
}

export function joinEvent(
  id: string,
  user: JoinUser,
): Promise<JoinResponse> {
  return apiRequest<JoinResponse>(`/events/${encodeURIComponent(id)}/join`, {
    method: "POST",
    body: JSON.stringify({ user }),
  });
}

export function getMyJoinedEvents(
  email: string,
): Promise<JoinedEventRecord[]> {
  return apiRequest<JoinedEventRecord[]>(
    `/my-events?email=${encodeURIComponent(email)}`,
  );
}

export function updateEvent(
  id: string,
  input: Partial<CreateEventInput>,
): Promise<EventRecord> {
  return apiRequest<{ event: EventRecord }>(
    `/events/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      body: JSON.stringify(input),
    },
  ).then((result) => result.event);
}

export function deleteEvent(id: string): Promise<void> {
  return apiRequest<void>(`/events/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
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
