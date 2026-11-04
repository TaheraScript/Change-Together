import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { isUpcoming } from "@/lib/events";
import {
  countJoins,
  findJoin,
  joinEventInDb,
  leaveEventInDb,
  lookupEvent,
} from "@/lib/events-server";

// Better Auth sessions and the Mongo driver both need Node.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * The session is read from the request cookie, never from the body, so the
 * stored join always belongs to the caller. Guests get 401 on writes but can
 * still read the public join count.
 */
async function getSessionUser(request: Request) {
  return getApiUser(request);
}

/** Public: join count + (when signed in) whether this user has joined. */
export async function GET(request: Request, { params }: RouteContext) {
  const { id } = await params;

  try {
    const [user, joinCount] = await Promise.all([
      getSessionUser(request),
      countJoins(id),
    ]);

    if (!user?.email) {
      return NextResponse.json({ joined: false, joinCount, joinedAt: null });
    }

    const join = await findJoin(id, user.email);

    return NextResponse.json({
      joined: Boolean(join),
      joinCount,
      joinedAt: join?.joinedAt ?? null,
    });
  } catch (error) {
    console.error("[join] status lookup failed:", error);
    return NextResponse.json(
      { message: "Couldn't load the join status for this event." },
      { status: 500 },
    );
  }
}

/** Join once. Repeating the request is a no-op, not a second row. */
export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;

  const user = await getSessionUser(request).catch(() => null);
  if (!user?.email) {
    return NextResponse.json(
      { message: "Please sign in to join this event." },
      { status: 401 },
    );
  }

  const lookup = await lookupEvent(id);

  if (lookup.status === "missing") {
    return NextResponse.json(
      { message: "This event no longer exists." },
      { status: 404 },
    );
  }
  if (lookup.status === "unavailable") {
    return NextResponse.json(
      { message: "Couldn't reach the events service." },
      { status: 502 },
    );
  }
  if (!isUpcoming(lookup.event.date)) {
    return NextResponse.json(
      { message: "This event has already taken place." },
      { status: 409 },
    );
  }

  try {
    const result = await joinEventInDb(lookup.event, {
      email: user.email,
      displayName: user.name ?? "",
      photoURL: user.image ?? null,
    });
    const joinCount = await countJoins(id);

    return NextResponse.json({
      joined: true,
      joinCount,
      joinedAt: result.joinedAt,
      alreadyJoined: !result.created,
    });
  } catch (error) {
    console.error("[join] could not store the join:", error);
    return NextResponse.json(
      { message: "Couldn't save your spot. Please try again." },
      { status: 500 },
    );
  }
}

/** Leave the event: removes the join row for the signed-in user. */
export async function DELETE(request: Request, { params }: RouteContext) {
  const { id } = await params;

  const user = await getSessionUser(request).catch(() => null);
  if (!user?.email) {
    return NextResponse.json(
      { message: "Please sign in to manage your spot." },
      { status: 401 },
    );
  }

  try {
    await leaveEventInDb(id, user.email);
    const joinCount = await countJoins(id);

    return NextResponse.json({ joined: false, joinCount, joinedAt: null });
  } catch (error) {
    console.error("[join] could not remove the join:", error);
    return NextResponse.json(
      { message: "Couldn't leave the event. Please try again." },
      { status: 500 },
    );
  }
}
