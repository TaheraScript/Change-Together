This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Authentication

Auth is handled entirely by [Better Auth](https://www.better-auth.com/) with
the MongoDB adapter — there is no other auth system in the codebase.

- `/register` — name, email, photo URL (optional), password.
  Passwords must contain an uppercase letter, a lowercase letter and be at
  least 6 characters; the rules are shown live under the field and failing
  them raises an inline error plus a toast.
- `/login` — email + password, plus "Continue with Google". A successful
  login shows a toast, and weak passwords are rejected before the request is
  sent.
- `/create-event` — only signed-in volunteers can publish; guests see a
  sign-in prompt.

Users, sessions and accounts live in the `change-together` MongoDB database
(`user`, `session`, `account`, `verification`). The session is read on the
client through `useSession` from `src/lib/auth-client.ts`; there is no
server-side session helper for components.

### Google sign-in

Google is enabled only when both server credentials are present:

```bash
# .env.local
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

Add `http://localhost:3000/api/auth/callback/google` as an authorised
redirect URI in the Google Cloud console (and `http://localhost:3000` as an
authorised JavaScript origin). Without these variables the button stays
visible but sign-in fails with a toast explaining that OAuth is not
configured.

## Home page

`/` is composed of `Hero` → `Features` → `RecentEvents` → `Gallery` →
`Newsletter`:

- `RecentEvents` fetches `/api/recent-events`, which queries the MongoDB
  `create-event` collection with
  `.find({ date: { $gte: today } }).sort({ date: 1 }).limit(6)` and falls
  back to the external REST API when Mongo is unreachable. The route is
  dynamic and Node-runtime so it always reflects newly created events.
- `Newsletter` is design-only: submitting shows a toast, nothing is stored.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
