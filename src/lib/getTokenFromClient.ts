import { authClient } from "./auth-client";

/**
 * Client-side helper for callers that authenticate with a Bearer JWT
 * (`Authorization: Bearer <token>`) instead of the session cookie.
 * Returns `null` for guests or when the token endpoint is unavailable.
 */
export const getTokenFromClient = async (): Promise<string | null> => {
  try {
    const { data } = await authClient.token();
    return data?.token ?? null;
  } catch {
    return null;
  }
};
