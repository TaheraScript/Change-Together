import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { auth } from "@/lib/auth";
import {
  EVENT_LIMITS,
  EVENT_TYPES,
  isValidEventImageUrl,
  type EventRecord,
} from "@/lib/events";
import {
  EDITABLE_EVENT_FIELDS,
  deleteEventInDb,
  findEventInMongo,
  updateEventInDb,
  type EventUpdate,
} from "@/lib/events-server";

// Ownership checks use the Better Auth session, so keep this on Node.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Prefer a server-only variable, fall back to the public one.
const API_URL = (
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? ""
).replace(/\/$/, "");

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

type RouteContext = { params: Promise<{ id: string }> };

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

function isOwner(event: EventRecord, email: string): boolean {
  const owner = normalizeEmail(event.organizerEmail);
  return Boolean(owner && owner === normalizeEmail(email));
}

/**
 * Signs a short-lived JWT for the current session so the external events API
 * can verify the caller against this app's public JWKS. Returns `null` when no
 * session is present, which makes the API answer 401.
 */
async function sessionBearer(request: Request): Promise<string | null> {
  try {
    const { token } = await auth.api.getToken({ headers: request.headers });
    return token ?? null;
  } catch {
    return null;
  }
}

/**
 * Whitelists and validates the editable fields. Returns the update or an
 * error message; ownership (`organizerEmail`) and `_id` can never change.
 */
function parseUpdate(
  body: unknown,
): { update: EventUpdate } | { message: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { message: "Invalid request body." };
  }

  const payload = body as Record<string, unknown>;
  const update: EventUpdate = {};

  for (const field of EDITABLE_EVENT_FIELDS) {
    if (!(field in payload)) continue;
    const value = payload[field];
    if (typeof value !== "string") {
      return { message: `${field} must be text.` };
    }
    update[field] = value.trim();
  }

  if (Object.keys(update).length === 0) {
    return { message: "No editable fields were provided." };
  }

  if (update.title !== undefined && update.title.length < 5) {
    return { message: "Add a clear event title (at least 5 characters)." };
  }
  if (
    update.title !== undefined &&
    update.title.length > EVENT_LIMITS.title
  ) {
    return {
      message: `The event title must be ${EVENT_LIMITS.title} characters or fewer.`,
    };
  }
  if (
    update.type !== undefined &&
    !EVENT_TYPES.includes(update.type as (typeof EVENT_TYPES)[number])
  ) {
    return { message: "Choose a valid event type." };
  }
  if (update.location !== undefined && update.location.length < 3) {
    return { message: "Add a venue or area for the event." };
  }
  if (
    update.location !== undefined &&
    update.location.length > EVENT_LIMITS.location
  ) {
    return {
      message: `The location must be ${EVENT_LIMITS.location} characters or fewer.`,
    };
  }
  if (update.description !== undefined && update.description.length < 20) {
    return {
      message:
        "Describe the event in at least 20 characters so volunteers know what to expect.",
    };
  }
  if (
    update.description !== undefined &&
    update.description.length > EVENT_LIMITS.description
  ) {
    return {
      message: `The description must be ${EVENT_LIMITS.description} characters or fewer.`,
    };
  }
  if (
    update.thumbnailUrl !== undefined &&
    !isValidEventImageUrl(update.thumbnailUrl)
  ) {
    return {
      message:
        "Use a valid image link starting with http(s):// or an image path.",
    };
  }
  if (
    update.date !== undefined &&
    (!DATE_PATTERN.test(update.date) ||
      Number.isNaN(new Date(`${update.date}T00:00:00`).getTime()))
  ) {
    return { message: "Choose a valid event date." };
  }

  return { update };
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;

  const user = await getApiUser(request);

  if (!user) {
    return NextResponse.json(
      { message: "Please sign in to manage events." },
      { status: 401 },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  const parsed = parseUpdate(body);
  if ("message" in parsed) {
    return NextResponse.json(
      { message: parsed.message },
      { status: 400 },
    );
  }

  // Mongo is the source of truth: update in place while the API is offline.
  const existing = await findEventInMongo(id);

  if (existing) {
    if (!isOwner(existing, user.email)) {
      return NextResponse.json(
        { message: "You can only change events you created." },
        { status: 403 },
      );
    }

    try {
      const updated = await updateEventInDb(id, parsed.update);
      if (!updated) {
        return NextResponse.json(
          { message: "This event no longer exists." },
          { status: 404 },
        );
      }
      return NextResponse.json(updated, { status: 200 });
    } catch (error) {
      console.error("[events] could not update the event:", error);
      return NextResponse.json(
        { message: "Couldn't update the event. Please try again." },
        { status: 500 },
      );
    }
  }

  // Fallback for deployments that still store events in the REST service.
  if (!API_URL) {
    return NextResponse.json(
      { message: "This event no longer exists." },
      { status: 404 },
    );
  }

  let restEvent: { organizerEmail?: string | null } | null = null;

  try {
    const res = await fetch(`${API_URL}/events/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });

    if (res.status === 404 || res.status === 400) {
      return NextResponse.json(
        { message: "This event no longer exists." },
        { status: 404 },
      );
    }
    if (!res.ok) {
      return NextResponse.json(
        { message: "Couldn't reach the events service." },
        { status: 502 },
      );
    }

    restEvent = await res.json();
  } catch {
    return NextResponse.json(
      { message: "Couldn't reach the events service." },
      { status: 502 },
    );
  }

  const owner = normalizeEmail(restEvent?.organizerEmail);
  if (!owner || owner !== normalizeEmail(user.email)) {
    return NextResponse.json(
      { message: "You can only change events you created." },
      { status: 403 },
    );
  }

  const token = await sessionBearer(request);

  try {
    const res = await fetch(`${API_URL}/events/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: {
        ...(token ? { authorization: `Bearer ${token}` } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(parsed.update),
    });

    if (!res.ok) {
      const payload = await res.json().catch(() => null);
      return NextResponse.json(
        payload ?? { message: "Couldn't update the event." },
        { status: res.status },
      );
    }

    // The events API answers with a Mongo update result, so read the event
    // back to hand the caller the fresh record.
    const updated = await fetch(`${API_URL}/events/${encodeURIComponent(id)}`, {
      cache: "no-store",
    }).then((r) => (r.ok ? r.json() : null));

    return NextResponse.json(updated ?? { updated: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Couldn't reach the events service." },
      { status: 502 },
    );
  }
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;

  const user = await getApiUser(request);

  if (!user) {
    return NextResponse.json(
      { message: "Please sign in to manage events." },
      { status: 401 },
    );
  }

  const existing = await findEventInMongo(id);

  if (existing) {
    if (!isOwner(existing, user.email)) {
      return NextResponse.json(
        { message: "You can only cancel events you created." },
        { status: 403 },
      );
    }

    try {
      const deleted = await deleteEventInDb(id);
      if (!deleted) {
        return NextResponse.json(
          { message: "This event no longer exists." },
          { status: 404 },
        );
      }
      return NextResponse.json({ deleted: true }, { status: 200 });
    } catch (error) {
      console.error("[events] could not delete the event:", error);
      return NextResponse.json(
        { message: "Couldn't cancel the event. Please try again." },
        { status: 500 },
      );
    }
  }

  // Fallback for deployments that still store events in the REST service.
  if (!API_URL) {
    return NextResponse.json(
      { message: "This event no longer exists." },
      { status: 404 },
    );
  }

  let restEvent: { organizerEmail?: string | null } | null = null;

  try {
    const res = await fetch(`${API_URL}/events/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });

    if (res.status === 404 || res.status === 400) {
      return NextResponse.json(
        { message: "This event no longer exists." },
        { status: 404 },
      );
    }
    if (!res.ok) {
      return NextResponse.json(
        { message: "Couldn't reach the events service." },
        { status: 502 },
      );
    }

    restEvent = await res.json();
  } catch {
    return NextResponse.json(
      { message: "Couldn't reach the events service." },
      { status: 502 },
    );
  }

  const owner = normalizeEmail(restEvent?.organizerEmail);
  if (!owner || owner !== normalizeEmail(user.email)) {
    return NextResponse.json(
      { message: "You can only cancel events you created." },
      { status: 403 },
    );
  }

  const token = await sessionBearer(request);

  try {
    const res = await fetch(`${API_URL}/events/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: token ? { authorization: `Bearer ${token}` } : {},
    });

    if (!res.ok && res.status !== 204) {
      const payload = await res.json().catch(() => null);
      return NextResponse.json(
        payload ?? { message: "Couldn't delete the event." },
        { status: res.status },
      );
    }

    return NextResponse.json({ deleted: true }, { status: 200 });
  } catch {
    return NextResponse.json(
      { message: "Couldn't reach the events service." },
      { status: 502 },
    );
  }
}
