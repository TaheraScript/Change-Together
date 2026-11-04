import { NextResponse } from "next/server";
import { getApiUser } from "@/lib/api-auth";
import { listJoinsByEmail } from "@/lib/events-server";

// The joined list is per session, so never cache or prerender it.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Events the signed-in volunteer has joined, newest join first. */
export async function GET(request: Request) {
  const user = await getApiUser(request);

  if (!user) {
    return NextResponse.json(
      { message: "Please sign in to see the events you've joined." },
      { status: 401 },
    );
  }

  try {
    return NextResponse.json(await listJoinsByEmail(user.email));
  } catch (error) {
    console.error("[my-events] query failed:", error);
    return NextResponse.json(
      { message: "Couldn't load the events you've joined." },
      { status: 500 },
    );
  }
}
