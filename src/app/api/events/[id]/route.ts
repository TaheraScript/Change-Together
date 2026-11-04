import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Ownership checks use the Better Auth session, so keep this on Node.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Prefer a server-only variable, fall back to the public one.
const API_URL = (
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? ""
).replace(/\/$/, "");

// Only these fields may be changed through this route.
const EDITABLE_FIELDS = [
  "title",
  "description",
  "type",
  "thumbnailUrl",
  "location",
  "date",
] as const;

type RouteContext = { params: Promise<{ id: string }> };

function normalizeEmail(value: unknown): string {
  return typeof value === "string" ? value.trim().toLowerCase() : "";
}

/**
 * Only the volunteer who created an event may update or delete it.
 * The external events API has no notion of ownership, so we enforce it here
 * against the signed-in Better Auth session before proxying the mutation.
 */
async function assertOwner(request: Request, id: string) {
  if (!API_URL) {
    console.error(
      "Events API URL is missing. Set NEXT_PUBLIC_API_URL (or API_URL) in .env.local and restart the server.",
    );
    return {
      response: NextResponse.json(
        { message: "The events service isn't configured." },
        { status: 500 },
      ),
    };
  }

  const session = await auth.api.getSession({ headers: request.headers });

  if (!session?.user?.email) {
    return {
      response: NextResponse.json(
        { message: "Please sign in to manage events." },
        { status: 401 },
      ),
    };
  }

  let event: { organizerEmail?: string | null };

  try {
    const res = await fetch(`${API_URL}/events/${encodeURIComponent(id)}`, {
      cache: "no-store",
    });

    if (res.status === 404 || res.status === 400) {
      return {
        response: NextResponse.json(
          { message: "This event no longer exists." },
          { status: 404 },
        ),
      };
    }

    if (!res.ok) {
      return {
        response: NextResponse.json(
          { message: "Couldn't reach the events service." },
          { status: 502 },
        ),
      };
    }

    event = await res.json();
  } catch {
    return {
      response: NextResponse.json(
        { message: "Couldn't reach the events service." },
        { status: 502 },
      ),
    };
  }

  const owner = normalizeEmail(event?.organizerEmail);
  const me = normalizeEmail(session.user.email);

  if (!owner || owner !== me) {
    return {
      response: NextResponse.json(
        { message: "You can only change events you created." },
        { status: 403 },
      ),
    };
  }

  return { event };
}

export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params;

  const guard = await assertOwner(request, id);
  if ("response" in guard) return guard.response;

  const body = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  // Whitelist fields so ownership (organizerEmail) and _id can't be changed.
  const update: Record<string, unknown> = {};
  for (const field of EDITABLE_FIELDS) {
    if (field in body) update[field] = (body as Record<string, unknown>)[field];
  }

  if (Object.keys(update).length === 0) {
    return NextResponse.json(
      { message: "No editable fields were provided." },
      { status: 400 },
    );
  }

  try {
    const res = await fetch(`${API_URL}/events/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(update),
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

  const guard = await assertOwner(request, id);
  if ("response" in guard) return guard.response;

  try {
    const res = await fetch(`${API_URL}/events/${encodeURIComponent(id)}`, {
      method: "DELETE",
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