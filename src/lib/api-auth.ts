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
    return null;
  }
}

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
  } catch {}

  return getJwtUser(request);
}
