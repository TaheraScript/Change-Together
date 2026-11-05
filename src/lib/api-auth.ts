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
 * Verifies a Better Auth JWT (`Authorization: Bearer <token>`).
 *
 * The token is checked against the JWKS public keys, including its
 * signature, expiry, issuer and audience. Any tampered or expired token
 * resolves to `null`, never to a "trusted" payload.
 */
async function getJwtUser(request: Request): Promise<ApiUser | null> {
  const token = bearerToken(request);
  if (!token) return null;

  try {
    const verified = await auth.api.verifyJWT({ body: { token } });
    const payload = verified?.payload;

    const email = typeof payload?.email === "string" ? payload.email : "";
    const id = typeof payload?.sub === "string" ? payload.sub : "";
    if (!email || !id) return null;

    return {
      id,
      email,
      name: typeof payload?.name === "string" ? payload.name : null,
      image: typeof payload?.image === "string" ? payload.image : null,
    };
  } catch {
    // Malformed token, unknown key, bad signature or an unreachable JWKS.
    return null;
  }
}

/**
 * Resolves the caller of a protected API route.
 *
 * Browser requests authenticate with the Better Auth session cookie; API and
 * mobile clients may instead send an `Authorization: Bearer <JWT>` issued by
 * the Better Auth jwt plugin. A valid session wins, otherwise the JWT is
 * verified server-side. A request that satisfies neither resolves to `null`,
 * so the route can answer 401.
 */
export async function getApiUser(request: Request): Promise<ApiUser | null> {
  try {
    const session = await auth.api.getSession({ headers: request.headers });

    if (session?.user?.email) {
      return {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name ?? null,
        image: session.user.image ?? null,
      };
    }
  } catch {
    // Auth/database outage: fall through to the bearer-token check.
  }

  return getJwtUser(request);
}
