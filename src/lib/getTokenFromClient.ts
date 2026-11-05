import { authClient } from "./auth-client";

export const getTokenFromClient = async (): Promise<string | null> => {
  try {
    const { data } = await authClient.token();
    return data?.token ?? null;
  } catch {
    return null;
  }
};
