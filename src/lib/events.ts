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

export type CommunityEvent = {
  id: string;
  title: string;
  description: string;
  type: EventType;
  thumbnailUrl: string;
  location: string;
  date: string; // YYYY-MM-DD
  organizerEmail: string;
  createdAt: string;
};

const EVENTS_KEY = "change-together:events";
const EVENTS_CHANGED_EVENT = "change-together:events-changed";

const isEvent = (value: unknown): value is CommunityEvent => {
  if (!value || typeof value !== "object") return false;
  const event = value as Partial<CommunityEvent>;
  return (
    typeof event.id === "string" &&
    typeof event.title === "string" &&
    typeof event.description === "string" &&
    typeof event.type === "string" &&
    typeof event.thumbnailUrl === "string" &&
    typeof event.location === "string" &&
    typeof event.date === "string" &&
    typeof event.organizerEmail === "string" &&
    typeof event.createdAt === "string"
  );
};

function parseEvents(raw: string | null): CommunityEvent[] {
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .filter(isEvent)
      .sort((a, b) => a.date.localeCompare(b.date));
  } catch {
    return [];
  }
}

export function getEvents(): CommunityEvent[] {
  if (typeof window === "undefined") return [];
  return parseEvents(window.localStorage.getItem(EVENTS_KEY));
}

/* Stable cached snapshot so useSyncExternalStore does not loop. */
let cachedRaw: string | null = null;
let cachedEvents: CommunityEvent[] | null = null;

export function getEventsSnapshot(): CommunityEvent[] {
  if (typeof window === "undefined") return [];
  const raw = window.localStorage.getItem(EVENTS_KEY);
  if (raw === cachedRaw && cachedEvents) return cachedEvents;

  cachedRaw = raw;
  cachedEvents = parseEvents(raw);
  return cachedEvents;
}

export function getServerEventsSnapshot(): CommunityEvent[] | null {
  return null;
}

export function subscribeToEvents(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (!event.key || event.key === EVENTS_KEY) callback();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(EVENTS_CHANGED_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(EVENTS_CHANGED_EVENT, callback);
  };
}

export function addEvent(
  input: Omit<CommunityEvent, "id" | "createdAt">,
): CommunityEvent {
  const event: CommunityEvent = {
    ...input,
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `event-${Date.now()}`,
    createdAt: new Date().toISOString(),
  };

  const events = getEvents();
  window.localStorage.setItem(EVENTS_KEY, JSON.stringify([...events, event]));
  window.dispatchEvent(new Event(EVENTS_CHANGED_EVENT));
  return event;
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

export function toDateInputValue(date: Date): string {
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}
