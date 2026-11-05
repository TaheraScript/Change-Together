import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import {
  EVENT_LIMITS,
  EVENT_TYPES,
  isValidEventImageUrl,
  toDateInputValue,
} from "@/lib/events";
import { createEventInDb, findUpcomingInDb } from "@/lib/events-server";

// Better Auth + Mongo both need Node.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function toText(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** Public list of upcoming events (Mongo is the source of truth). */
export async function GET() {
  try {
    return NextResponse.json(await findUpcomingInDb());
  } catch (error) {
    console.error("[events] list failed:", error);
    return NextResponse.json(
      { message: "Couldn't load events. Please try again." },
      { status: 500 },
    );
  }
}

/**
 * Creates an event for the signed-in volunteer. The organiser always comes
 * from the session, so a caller can never create an event for someone else.
 */
export async function POST(request: Request) {
  const user = await getApiUser(request);

  if (!user) {
    return NextResponse.json(
      { message: "Please sign in to create an event." },
      { status: 401 },
    );
  }

  const body: unknown = await request.json().catch(() => null);
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return NextResponse.json(
      { message: "Invalid request body." },
      { status: 400 },
    );
  }

  const payload = body as Record<string, unknown>;
  const title = toText(payload.title);
  const description = toText(payload.description);
  const type = toText(payload.type);
  const thumbnailUrl = toText(payload.thumbnailUrl);
  const location = toText(payload.location);
  const date = toText(payload.date);

  if (title.length < 5) {
    return NextResponse.json(
      { message: "Add a clear event title (at least 5 characters)." },
      { status: 400 },
    );
  }
  if (title.length > EVENT_LIMITS.title) {
    return NextResponse.json(
      {
        message: `The event title must be ${EVENT_LIMITS.title} characters or fewer.`,
      },
      { status: 400 },
    );
  }
  if (!EVENT_TYPES.includes(type as (typeof EVENT_TYPES)[number])) {
    return NextResponse.json(
      { message: "Choose a valid event type." },
      { status: 400 },
    );
  }
  if (
    !DATE_PATTERN.test(date) ||
    Number.isNaN(new Date(`${date}T00:00:00`).getTime())
  ) {
    return NextResponse.json(
      { message: "Choose a valid event date." },
      { status: 400 },
    );
  }
  if (date <= toDateInputValue(new Date())) {
    return NextResponse.json(
      { message: "The event date must be in the future." },
      { status: 400 },
    );
  }
  if (location.length < 3) {
    return NextResponse.json(
      { message: "Add a venue or area for the event." },
      { status: 400 },
    );
  }
  if (location.length > EVENT_LIMITS.location) {
    return NextResponse.json(
      {
        message: `The location must be ${EVENT_LIMITS.location} characters or fewer.`,
      },
      { status: 400 },
    );
  }
  if (!thumbnailUrl) {
    return NextResponse.json(
      { message: "Add a thumbnail image URL for your event." },
      { status: 400 },
    );
  }
  if (!isValidEventImageUrl(thumbnailUrl)) {
    return NextResponse.json(
      {
        message:
          "Use a valid image link starting with http(s):// or an image path.",
      },
      { status: 400 },
    );
  }
  if (description.length < 20) {
    return NextResponse.json(
      {
        message:
          "Describe the event in at least 20 characters so volunteers know what to expect.",
      },
      { status: 400 },
    );
  }
  if (description.length > EVENT_LIMITS.description) {
    return NextResponse.json(
      {
        message: `The description must be ${EVENT_LIMITS.description} characters or fewer.`,
      },
      { status: 400 },
    );
  }

  try {
    const event = await createEventInDb({
      title,
      description,
      type,
      thumbnailUrl,
      location,
      date,
      organizerEmail: user.email,
    });

    return NextResponse.json(
      { insertedId: event._id, event },
      { status: 201 },
    );
  } catch (error) {
    console.error("[events] could not create the event:", error);
    return NextResponse.json(
      { message: "Couldn't publish your event. Please try again." },
      { status: 500 },
    );
  }
}
