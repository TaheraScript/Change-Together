export type SessionUser = {
  displayName: string;
  email: string;
  photoURL?: string;
  provider?: "password" | "google";
};

type StoredAccount = {
  displayName: string;
  email: string;
  photoURL: string;
  salt: string;
  passwordHash: string | null;
  provider: "password" | "google";
  createdAt: string;
};

export class AuthError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.name = "AuthError";
    this.code = code;
  }
}

const SESSION_KEYS = [
  "change-together:user",
  "ct-user",
  "user",
] as const;
const ACCOUNTS_KEY = "change-together:accounts";
const USER_CHANGED_EVENT = "change-together:user-changed";

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

export const PASSWORD_RULES = [
  {
    id: "length",
    label: "At least 6 characters",
    test: (value: string) => value.length >= 6,
  },
  {
    id: "uppercase",
    label: "One uppercase letter (A–Z)",
    test: (value: string) => /[A-Z]/.test(value),
  },
  {
    id: "lowercase",
    label: "One lowercase letter (a–z)",
    test: (value: string) => /[a-z]/.test(value),
  },
] as const;

export type PasswordCheck = {
  id: string;
  label: string;
  met: boolean;
};

export function checkPassword(password: string): PasswordCheck[] {
  return PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    met: rule.test(password),
  }));
}

export function isPasswordValid(password: string): boolean {
  return checkPassword(password).every((check) => check.met);
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/* ------------------------------------------------------------------ */
/* Storage helpers                                                     */
/* ------------------------------------------------------------------ */

function createSalt(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join(
    "",
  );
}

async function hashPassword(password: string, salt: string): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) {
    throw new AuthError(
      "CRYPTO_UNAVAILABLE",
      "Your browser can't secure passwords right now. Try a modern browser or a secure (https) connection.",
    );
  }

  const data = new TextEncoder().encode(`${salt}::${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest), (byte) =>
    byte.toString(16).padStart(2, "0"),
  ).join("");
}

function isStoredAccount(value: unknown): value is StoredAccount {
  if (!value || typeof value !== "object") return false;
  const account = value as Partial<StoredAccount>;
  return (
    typeof account.displayName === "string" &&
    typeof account.email === "string" &&
    typeof account.salt === "string" &&
    (typeof account.passwordHash === "string" ||
      account.passwordHash === null) &&
    (account.provider === "password" || account.provider === "google")
  );
}

function readAccounts(): StoredAccount[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(ACCOUNTS_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(isStoredAccount);
  } catch {
    return [];
  }
}

function writeAccounts(accounts: StoredAccount[]) {
  window.localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
}

/* ------------------------------------------------------------------ */
/* Session                                                             */
/* ------------------------------------------------------------------ */

function normalizeSession(value: unknown): SessionUser | null {
  if (!value || typeof value !== "object") return null;
  const candidate = value as {
    displayName?: unknown;
    name?: unknown;
    email?: unknown;
    photoURL?: unknown;
    provider?: unknown;
  };

  if (typeof candidate.email !== "string" || !candidate.email.trim()) {
    return null;
  }

  const email = candidate.email.trim().toLowerCase();
  const displayName =
    typeof candidate.displayName === "string" && candidate.displayName.trim()
      ? candidate.displayName.trim()
      : typeof candidate.name === "string" && candidate.name.trim()
        ? candidate.name.trim()
        : email.split("@")[0];

  return {
    displayName,
    email,
    photoURL:
      typeof candidate.photoURL === "string" && candidate.photoURL.trim()
        ? candidate.photoURL.trim()
        : undefined,
    provider: candidate.provider === "google" ? "google" : "password",
  };
}

function readSession(): SessionUser | null {
  if (typeof window === "undefined") return null;

  for (const key of SESSION_KEYS) {
    try {
      const raw = window.localStorage.getItem(key);
      if (!raw) continue;
      const session = normalizeSession(JSON.parse(raw));
      if (session) return session;
    } catch {
      // Ignore malformed session values and try the next key.
    }
  }

  return null;
}

function sessionStorageKey(): string {
  return SESSION_KEYS.map(
    (key) => window.localStorage.getItem(key) ?? "",
  ).join("|");
}

let cachedStorageKey: string | null = null;
let cachedSession: SessionUser | null = null;

export function getUserSnapshot(): SessionUser | null {
  if (typeof window === "undefined") return null;

  const key = sessionStorageKey();
  if (key === cachedStorageKey) return cachedSession;

  cachedStorageKey = key;
  cachedSession = readSession();
  return cachedSession;
}

export function getServerUserSnapshot(): SessionUser | null {
  return null;
}

export function subscribeToUser(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {};

  const onStorage = (event: StorageEvent) => {
    if (!event.key || SESSION_KEYS.includes(event.key as never)) callback();
  };

  window.addEventListener("storage", onStorage);
  window.addEventListener(USER_CHANGED_EVENT, callback);
  return () => {
    window.removeEventListener("storage", onStorage);
    window.removeEventListener(USER_CHANGED_EVENT, callback);
  };
}

export function getSessionUser(): SessionUser | null {
  return readSession();
}

function writeSession(user: SessionUser) {
  window.localStorage.setItem(SESSION_KEYS[0], JSON.stringify(user));
  window.dispatchEvent(new Event(USER_CHANGED_EVENT));
}

export function logoutUser() {
  if (typeof window === "undefined") return;
  for (const key of SESSION_KEYS) window.localStorage.removeItem(key);
  window.dispatchEvent(new Event(USER_CHANGED_EVENT));
}

/* ------------------------------------------------------------------ */
/* Email + password                                                    */
/* ------------------------------------------------------------------ */

export type RegisterInput = {
  name: string;
  email: string;
  photoURL: string;
  password: string;
};

export async function registerWithEmail(
  input: RegisterInput,
): Promise<SessionUser> {
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const photoURL = input.photoURL.trim();

  if (name.length < 2) {
    throw new AuthError("INVALID_NAME", "Please enter your full name.");
  }
  if (!isValidEmail(email)) {
    throw new AuthError(
      "INVALID_EMAIL",
      "That email doesn't look right. Check it and try again.",
    );
  }
  if (photoURL && !/^https?:\/\/.+/i.test(photoURL)) {
    throw new AuthError(
      "INVALID_PHOTO",
      "Photo URL must start with http:// or https://.",
    );
  }
  if (!isPasswordValid(input.password)) {
    throw new AuthError(
      "WEAK_PASSWORD",
      "Password needs an uppercase letter, a lowercase letter and at least 6 characters.",
    );
  }

  const accounts = readAccounts();
  if (accounts.some((account) => account.email === email)) {
    throw new AuthError(
      "EMAIL_TAKEN",
      "An account with this email already exists. Try logging in instead.",
    );
  }

  const salt = createSalt();
  const passwordHash = await hashPassword(input.password, salt);

  writeAccounts([
    ...accounts,
    {
      displayName: name,
      email,
      photoURL,
      salt,
      passwordHash,
      provider: "password",
      createdAt: new Date().toISOString(),
    },
  ]);

  const user: SessionUser = {
    displayName: name,
    email,
    photoURL: photoURL || undefined,
    provider: "password",
  };
  writeSession(user);
  return user;
}

export async function loginWithEmail(
  emailInput: string,
  password: string,
): Promise<SessionUser> {
  const email = emailInput.trim().toLowerCase();

  if (!isValidEmail(email)) {
    throw new AuthError(
      "INVALID_EMAIL",
      "That email doesn't look right. Check it and try again.",
    );
  }
  if (!password) {
    throw new AuthError("MISSING_PASSWORD", "Enter your password to continue.");
  }

  const account = readAccounts().find((item) => item.email === email);
  if (!account) {
    throw new AuthError(
      "NO_ACCOUNT",
      "We couldn't find an account with that email. Create one first.",
    );
  }
  if (!account.passwordHash) {
    throw new AuthError(
      "SOCIAL_ACCOUNT",
      "This account uses Google sign-in. Continue with Google instead.",
    );
  }

  const passwordHash = await hashPassword(password, account.salt);
  if (passwordHash !== account.passwordHash) {
    throw new AuthError(
      "WRONG_PASSWORD",
      "That password doesn't match. Please try again.",
    );
  }

  const user: SessionUser = {
    displayName: account.displayName,
    email: account.email,
    photoURL: account.photoURL || undefined,
    provider: "password",
  };
  writeSession(user);
  return user;
}

/* ------------------------------------------------------------------ */
/* Google OAuth                                                        */
/* ------------------------------------------------------------------ */

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_SCRIPT_ID = "google-identity-services";

type GoogleTokenResponse = {
  access_token?: string;
  error?: string;
  error_description?: string;
};

type GoogleTokenClient = {
  requestAccessToken: (overrideConfig?: { prompt?: string }) => void;
};

type GoogleIdentity = {
  accounts?: {
    oauth2?: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        callback: (response: GoogleTokenResponse) => void;
        error_callback?: (error: { message?: string }) => void;
      }) => GoogleTokenClient;
    };
  };
};

declare global {
  interface Window {
    google?: GoogleIdentity;
  }
}

export function isGoogleOAuthConfigured(): boolean {
  return Boolean(GOOGLE_CLIENT_ID);
}

function loadGoogleScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined") {
      reject(
        new AuthError(
          "SSR",
          "Google sign-in is only available in the browser.",
        ),
      );
      return;
    }

    if (window.google?.accounts?.oauth2) {
      resolve();
      return;
    }

    const existing = document.getElementById(
      GOOGLE_SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () =>
          reject(
            new AuthError(
              "GOOGLE_LOAD_FAILED",
              "Couldn't reach Google. Check your connection and try again.",
            ),
          ),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = GOOGLE_SCRIPT_ID;
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () =>
      reject(
        new AuthError(
          "GOOGLE_LOAD_FAILED",
          "Couldn't reach Google. Check your connection and try again.",
        ),
      );
    document.head.appendChild(script);
  });
}

async function requestGoogleAccessToken(): Promise<string> {
  await loadGoogleScript();

  const oauth = window.google?.accounts?.oauth2;
  if (!oauth) {
    throw new AuthError(
      "GOOGLE_LOAD_FAILED",
      "Google sign-in couldn't start. Please try again.",
    );
  }

  return new Promise<string>((resolve, reject) => {
    const client = oauth.initTokenClient({
      client_id: GOOGLE_CLIENT_ID as string,
      scope: "openid email profile",
      callback: (response) => {
        if (response.access_token) {
          resolve(response.access_token);
        } else {
          reject(
            new AuthError(
              "GOOGLE_CANCELLED",
              "Google sign-in was cancelled before it finished.",
            ),
          );
        }
      },
      error_callback: (error) =>
        reject(
          new AuthError(
            "GOOGLE_CANCELLED",
            error.message || "Google sign-in was cancelled.",
          ),
        ),
    });

    client.requestAccessToken({ prompt: "select_account" });
  });
}

type GoogleProfile = {
  name?: string;
  email?: string;
  picture?: string;
};

async function fetchGoogleProfile(
  accessToken: string,
): Promise<Required<Pick<GoogleProfile, "email">> & GoogleProfile> {
  const response = await fetch(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    { headers: { Authorization: `Bearer ${accessToken}` } },
  );

  if (!response.ok) {
    throw new AuthError(
      "GOOGLE_PROFILE_FAILED",
      "Google didn't share your profile. Please try again.",
    );
  }

  const profile = (await response.json()) as GoogleProfile;
  if (!profile.email) {
    throw new AuthError(
      "GOOGLE_PROFILE_FAILED",
      "Google didn't share an email address for this account.",
    );
  }
  return profile as Required<Pick<GoogleProfile, "email">> & GoogleProfile;
}

const DEMO_GOOGLE_USER: SessionUser = {
  displayName: "Ayesha Rahman",
  email: "ayesha.rahman@gmail.com",
  provider: "google",
};

function upsertGoogleAccount(user: SessionUser): SessionUser {
  const accounts = readAccounts();
  const existing = accounts.find(
    (account) => account.email === user.email.toLowerCase(),
  );

  if (existing) {
    return {
      displayName: existing.displayName,
      email: existing.email,
      photoURL: existing.photoURL || user.photoURL,
      provider: "google",
    };
  }

  writeAccounts([
    ...accounts,
    {
      displayName: user.displayName,
      email: user.email.toLowerCase(),
      photoURL: user.photoURL ?? "",
      salt: "",
      passwordHash: null,
      provider: "google",
      createdAt: new Date().toISOString(),
    },
  ]);

  return user;
}

/**
 * Signs the visitor in with Google. When NEXT_PUBLIC_GOOGLE_CLIENT_ID is set
 * the real Google Identity Services OAuth flow runs; otherwise the site falls
 * back to a demo Google account so the flow can still be exercised locally.
 */
export async function loginWithGoogle(): Promise<{
  user: SessionUser;
  demo: boolean;
}> {
  if (!GOOGLE_CLIENT_ID) {
    await new Promise((resolve) => setTimeout(resolve, 700));
    const user = upsertGoogleAccount(DEMO_GOOGLE_USER);
    writeSession(user);
    return { user, demo: true };
  }

  const accessToken = await requestGoogleAccessToken();
  const profile = await fetchGoogleProfile(accessToken);

  const user: SessionUser = {
    displayName: profile.name?.trim() || profile.email.split("@")[0],
    email: profile.email.trim().toLowerCase(),
    photoURL: profile.picture,
    provider: "google",
  };

  const stored = upsertGoogleAccount(user);
  writeSession(stored);
  return { user: stored, demo: false };
}
