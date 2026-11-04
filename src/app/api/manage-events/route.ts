import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { listEventsByOrganizer } from "@/lib/events-server";

// The owned-events list is per session, so never cache or prerender it.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Events created by the signed-in volunteer, earliest event date first. */
export async function GET(request: Request) {
  const user = await getApiUser(request);

  if (!user) {
    return NextResponse.json(
      { message: "Please sign in to manage your events." },
      { status: 401 },
    );
  }

  try {
    return NextResponse.json(await listEventsByOrganizer(user.email));
  } catch (error) {
    console.error("[manage-events] query failed:", error);
    return NextResponse.json(
      { message: "Couldn't load the events you created." },
      { status: 500 },
    );
  }
}
