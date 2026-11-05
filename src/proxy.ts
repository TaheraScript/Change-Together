import { NextResponse, type NextRequest } from "next/server";
import { auth } from "@/lib/auth";

/**
 * The single access gate for signed-in-only pages.
 *
 * `config.matcher` below is the authoritative list of private routes: the
 * check runs before any matched route renders, for full page loads, client
 * `<Link>` navigations, prefetches, `next dev` and `next start`. The pages
 * themselves do not check for a session before rendering.
 *
 * Use `request.headers` (not `headers()` from `next/headers`) so the lookup
 * reads this specific request instead of an ambient request context.
 */
export async function proxy(request: NextRequest) {
  let signedIn = false;

  try {
    const session = await auth.api.getSession({ headers: request.headers });
    signedIn = Boolean(session?.user);
  } catch {
    // Auth/DB outage: fail closed so a private page is never served.
    signedIn = false;
  }

  if (signedIn) {
    return NextResponse.next();
  }

  // Send the visitor to /login and bring them back afterwards.
  // Only the path is forwarded, so this cannot become an open redirect.
  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set(
    "next",
    `${request.nextUrl.pathname}${request.nextUrl.search}`,
  );

  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: [
    "/create-event/:path*",
    "/manage-events/:path*",
    "/joined-events/:path*",
    "/profile/:path*",
  ],
};
