import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import { jwt } from "better-auth/plugins";

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("change-together");

const isGithubConfigured = Boolean(
  process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
);

// Mirrors the rule enforced by the register form in the UI.
const PASSWORD_PATTERN = /^(?=.*[a-z])(?=.*[A-Z]).{6,128}$/;

export const auth = betterAuth({
  baseURL: process.env.BETTER_AUTH_URL as string,
  secret: process.env.BETTER_AUTH_SECRET as string,
  database: mongodbAdapter(db, {
    client,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 6,
  },
  ...(isGithubConfigured
    ? {
        socialProviders: {
          github: {
            clientId: process.env.GITHUB_CLIENT_ID as string,
            clientSecret: process.env.GITHUB_CLIENT_SECRET as string,
          },
        },
      }
    : {}),
  hooks: {
    before: createAuthMiddleware(async (ctx) => {
      // Email/password sign-up: enforce the same rules server-side, so the
      // form can't be bypassed by calling the auth API directly. GitHub
      // sign-ups have no password body and are left alone.
      if (ctx.path !== "/sign-up/email") return;

      const body = (ctx.body ?? {}) as {
        name?: unknown;
        password?: unknown;
      };

      const name = typeof body.name === "string" ? body.name.trim() : "";
      if (name.length < 2) {
        throw new APIError("BAD_REQUEST", {
          message: "Please enter your full name.",
        });
      }
      if (name.length > 80) {
        throw new APIError("BAD_REQUEST", {
          message: "Your name must be 80 characters or fewer.",
        });
      }

      const password = typeof body.password === "string" ? body.password : "";
      if (!PASSWORD_PATTERN.test(password)) {
        throw new APIError("BAD_REQUEST", {
          message:
            "Password needs an uppercase letter, a lowercase letter and 6–128 characters.",
        });
      }
    }),
  },
  plugins: [jwt()],
  // No cookie cache: a profile update must be visible on the very next
  // session read (navbar, profile page, protected APIs) instead of waiting
  // for a cached user snapshot to expire.
  session: {
    cookieCache: {
      enabled: false,
    },
  },
});

export type Session = typeof auth.$Infer.Session;
