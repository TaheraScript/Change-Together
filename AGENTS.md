# AGENTS.md

## Commands

- `npm run dev` — Turbopack dev server on http://localhost:3000.
- `npx tsc --noEmit` — typecheck (no script). `tsconfig` pulls route types from `.next/types` and `.next/dev/types`, so run `npm run dev` or `npm run build` once on a fresh clone before typechecking.
- `npm run build` — the closest thing to a test suite (no tests, no CI, no pre-commit hooks).
- `npm run lint` — **exits 1 on a clean checkout**: committed scratch scripts `tmp-classes.js`, `tmp-cleanup-qa.js`, `tmp-css-check.js` (`no-require-imports`) and `src/components/ui/carousel.tsx` (`react-hooks/set-state-in-effect`) already fail; `RegisterForm.tsx` also warns about an unused `FormEvent`. Not regressions — don't hand-fix vendored `src/components/ui/*`.

## Setup: env is not committed

`.env*` is gitignored, so a fresh clone needs its own `.env`:

- Required: `MONGODB_URI`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL` and `NEXT_PUBLIC_BETTER_AUTH_URL` (both `http://localhost:3000`), `NEXT_PUBLIC_API_URL` (events REST API, e.g. `http://localhost:5000`).
- Optional GitHub OAuth: `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` — the provider is only registered when both exist (`src/lib/auth.ts`).
- There is **no default** for `NEXT_PUBLIC_API_URL`: `src/lib/events.ts` falls back to `""` and every event call then throws the "events service isn't configured" `ApiError`.

## Architecture: two backends, both external to the app code

- **Auth** is Better Auth + `@better-auth/mongo-adapter` (`src/lib/auth.ts`), mounted at `src/app/api/auth/[...all]/route.ts`. Users/sessions/accounts live in the `change-together` Mongo DB. Server code reads the session with `auth.api.getSession({ headers })`; client code uses `useSession` from `src/lib/auth-client.ts`. There is no session helper for components — the client hook is the only way.
- **Events** live in a separate REST API behind `NEXT_PUBLIC_API_URL`. Every endpoint the app uses is wrapped in `src/lib/events.ts` (all `cache: "no-store"`). That backend is a different project and can simply be down; failures are expected and render as empty/error states.
- **Reads fall back to Mongo.** `src/lib/events-server.ts` (server-only) looks events up in the `create-event` collection first, then the REST API, so `/events/[id]` and `/upcoming-events` keep working when the backend is offline. Server components use this module; client components use `src/lib/events.ts` (same-origin routes only).
- **Joins live in MongoDB** (`event-joins`), owned by this app: `/api/events/[id]/join` (GET status + count, POST join, DELETE leave) and `/api/my-events`. Each row stores a snapshot of the user and the event; a unique `{eventId, "user.email"}` index enforces one join per user per event. The signed-in user always comes from the Better Auth session, never from the request body.
- `src/lib/mongodb.ts` is a **second, unrelated `MongoClient`** (cached on `globalThis`, `MONGODB_DB_NAME` default `change-together`) used by `/api/recent-events` and everything in `events-server.ts`. `src/lib/auth.ts` builds its own client at module import time, so a missing `MONGODB_URI` throws as soon as anything imports `auth`.

## Auth and ownership gotchas

- `src/proxy.ts` is Next 16's `middleware.ts` replacement (file name `proxy.ts`, exported function `proxy`). It is the **only** access gate: it redirects signed-out users from `/create-event`, `/manage-events`, `/joined-events` to `/login?next=…`, and new gated pages belong in its `config.matcher`. Don't create a `middleware.ts`, and don't add page-level session redirects — components there only read the session for data (`useSession`), because the proxy has already guaranteed one.
- The external events API has **no notion of ownership**. `/api/events/[id]` PATCH/DELETE is a same-origin proxy that validates `auth.api.getSession`, compares `organizerEmail`, then whitelists editable fields. `updateEvent`/`deleteEvent` in `src/lib/events.ts` intentionally go through it — don't "simplify" them into direct external-API calls.
- Client-side owner checks use `isEventOwner()` (lowercased `organizerEmail` vs session email). `CreateEventForm` sets `organizerEmail` from the session user.
- `/events/[id]/edit` is not in the proxy matcher; the write is rejected server-side, so a non-owner sees the form but cannot save.

## Stack quirks

- Next.js 16 App Router under `src/app`; alias `@/*` → `src/*`. **`params` is a `Promise`** in pages and route handlers — `await params`.
- Tailwind v4 CSS-first: no `tailwind.config`; theme, keyframes, and utilities live in `src/app/globals.css`. CSS is compiled by `@tailwindcss/turbopack` (inline rule in `next.config.ts`).
- **Dark mode is hand-rolled.** No `next-themes`: `ThemeToggle` flips `.dark` on `<html>`, persists to `change-together:theme`, and `layout.tsx` injects a pre-paint script. Because components hardcode palette values (`#164E63` teal, `#16A34A` green, `#FBFAF6` cream, `bg-white`, `slate-*`), dark mode works through `.dark .bg-white { … }`-style overrides at the bottom of `globals.css`. A new color/background utility needs a matching `.dark` override or it stays light.
- **React Compiler is enabled** (`reactCompiler: true` + `babel-plugin-react-compiler`). Don't add `useMemo`/`useCallback`/`React.memo` for performance.
- `cacheComponents` and `partialPrefetching` are both off. Pages that must show new events are `export const dynamic = "force-dynamic"`.
- UI is shadcn/ui, **base-nova style on `@base-ui/react`** (not Radix) — see `components.json`. Prebuilt primitives are in `src/components/ui`; add new ones with the `shadcn` CLI, not by hand. Note Base UI's `render={<Link />}` prop instead of Radix's `asChild`.
- Images use plain `<img>` via `components/event/EventImage.tsx` (onError fallback + retry); there is no `next/image` `remotePatterns` config, so remote thumbnails would fail with `next/image`.

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

## Routes

Pages: `/` (Hero → Features → RecentEvents → Gallery → Newsletter) · `/events/[id]` (server-fetched, has `loading.tsx`) · `/events/[id]/edit` · `/upcoming-events` · `/joined-events` · `/create-event` · `/manage-events` (list of events you own, with edit/cancel) · `/login` · `/register`.

Route handlers: `/api/auth/[...all]` (Better Auth) · `/api/events/[id]` (owner-checked PATCH/DELETE) · `/api/recent-events` (Mongo, REST fallback).

Feature components are grouped in `src/components/{auth,event,home,shared}`; each page exports its own `metadata`.

## Docs caveat

`README.md` still describes Google sign-in — the code implements **GitHub** OAuth (`GithubButton.tsx`, `GITHUB_CLIENT_*`). Password rule enforced in the UI: ≥6 chars with an uppercase and a lowercase letter (server-side minimum is 6).
