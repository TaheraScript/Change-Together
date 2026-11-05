import { headers } from "next/headers";
import { auth } from "./auth";

export async function getTokenFromServer(): Promise<string | null> {
  try {
    const result = await auth.api.getToken({ headers: await headers() });
    return result?.token ?? null;
  } catch {
    return null;
  }
}
