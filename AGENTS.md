# AGENTS.md

## Commands

- `npm run dev` — dev server (Turbopack) on http://localhost:3000
- `npm run lint` — ESLint (flat config, `eslint-config-next` core-web-vitals + TS)
- `npx tsc --noEmit` — typecheck (no dedicated script). Run `npm run dev` or `npm run build` first when route types are missing — tsconfig includes `.next/types/**/*.ts` and `.next/dev/types/**/*.ts`.
- No tests exist; no CI or pre-commit hooks — `npm run lint`, then `npx tsc --noEmit`, then `npm run build` is the full local verification. `npm run build` is the closest thing to a test suite.

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

## Stack quirks

- Next.js 16 App Router under `src/app`; alias `@/*` → `src/*`.
- Tailwind v4 CSS-first: no `tailwind.config`; theme lives in `src/app/globals.css`. CSS is loaded through `@tailwindcss/turbopack` (configured inline in `next.config.ts`).
- **React Compiler is enabled** (`reactCompiler: true` + `babel-plugin-react-compiler`). Don't hand-add `useMemo`/`useCallback`/`React.memo` "for performance" — the compiler handles it.
- `cacheComponents` and `partialPrefetching` are both disabled in `next.config.ts`.
- UI is shadcn/ui with the **base-nova style on `@base-ui/react`** (not Radix) — see `components.json`. Prebuilt primitives live in `src/components/ui`; add new ones with the `shadcn` CLI, not by hand.

## Architecture: frontend-only, external API

- This repo contains **no backend**. Event data comes from a separate REST API (default `http://localhost:5000`, override with `NEXT_PUBLIC_API_URL` in `.env.local` — no env files are committed). All endpoints used are in `src/lib/events.ts`; every call uses `cache: "no-store"`. It is not included in this repo and may just be down — fetch failures are expected and handled.
- Known inconsistency: `src/app/events/[id]/page.tsx` (server component) hardcodes `http://localhost:5000` instead of using the `API_URL` from `src/lib/events.ts`. Keep both in sync if the backend URL changes.
- Auth is **fully client-side** in `src/lib/auth.ts`: accounts + session live in `localStorage`, passwords are salted/SHA-256 hashed via Web Crypto, Google sign-in uses Google Identity Services when `NEXT_PUBLIC_GOOGLE_CLIENT_ID` is set, otherwise falls back to a fake demo user. Don't try to read the session from a server component — `getServerUserSnapshot()` always returns `null`.
- The README predates the REST API migration and wrongly says events are stored in localStorage; trust the code.
- Legacy session keys: reads check `change-together:user`, `ct-user`, and `user` (in that order); writes only use `change-together:user`. Removing or reordering `SESSION_KEYS` breaks compat with old browser data.
- Pattern for consuming auth state in components: `useSyncExternalStore(subscribeToUser, getUserSnapshot, getServerUserSnapshot)` (see `Navbar`, `JoinPanel`, etc.). `getUserSnapshot` caches on a localStorage key fingerprint — don't replace it with a plain read or React will throw "getSnapshot should be cached".

## Routes

`/` (hero + gallery) · `/events/[id]` (details/join, has `loading.tsx`) · `/upcoming-events` · `/joined-events` (auth-gated) · `/create-event` (auth-gated) · `/login` · `/register`. Feature components are grouped in `src/components/{auth,event,home,shared}`; metadata is exported per page.
