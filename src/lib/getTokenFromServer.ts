import { headers } from "next/headers";
import { auth } from "./auth";

/**
 * Optional Better Auth JWT for the events API.
 *
 * `auth.api.getToken` throws when there is no session, so this returns `null`
 * for guests — public pages (like event details) must never crash on it.
 */
export async function getTokenFromServer(): Promise<string | null> {
  try {
    const result = await auth.api.getToken({ headers: await headers() });
    return result?.token ?? null;
  } catch {
    return null;
  }
}
