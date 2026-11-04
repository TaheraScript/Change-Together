import { auth } from "@/lib/auth";

export type ApiUser = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
};

function bearerToken(request: Request): string | null {
  const header = request.headers.get("authorization");
  if (!header) return null;
  const match = /^Bearer\s+(\S+)$/i.exec(header.trim());
  return match ? match[1] : null;
}

/**
 * Resolves the caller of a protected API route.
 *
 * Browser requests authenticate with the Better Auth session cookie; API and
 * mobile clients may instead send an `Authorization: Bearer <JWT>` issued by
 * the Better Auth jwt plugin. Both paths are verified server-side against the
 * JWKS, and a request that satisfies neither resolves to `null`, so the route
 * can answer 401.
 */
export async function getApiUser(request: Request): Promise<ApiUser | null> {
  const session = await auth.api
    .getSession({ headers: request.headers })
    .catch(() => null);

  if (session?.user?.email) {
    return {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name ?? null,
      image: session.user.image ?? null,
    };
  }

  const token = bearerToken(request);
  if (!token) return null;

  const verified = await auth.api
    .verifyJWT({ body: { token } })
    .catch(() => null);

  const payload = verified?.payload;
  const email = typeof payload?.email === "string" ? payload.email : "";
  if (!email) return null;

  return {
    id: typeof payload?.sub === "string" ? payload.sub : "",
    email,
    name: typeof payload?.name === "string" ? payload.name : null,
    image: typeof payload?.image === "string" ? payload.image : null,
  };
}
