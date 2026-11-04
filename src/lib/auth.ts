import { betterAuth} from "better-auth";
import { MongoClient } from "mongodb";
import { mongodbAdapter } from "@better-auth/mongo-adapter";
import {jwt} from 'better-auth/plugins'

const client = new MongoClient(process.env.MONGODB_URI as string);
const db = client.db("change-together");

const isGithubConfigured = Boolean(
  process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET,
);

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
    plugins:[jwt()],
    session:{
     cookieCache:{
       enabled:true,
      strategy:'jwt',
      maxAge:5*60
     }
    }
});

export type Session = typeof auth.$Infer.Session;