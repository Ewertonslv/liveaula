# liveaula

**A full-stack EdTech platform for private lessons**: a TypeScript monorepo with a shared, end-to-end
**typed contract** between a Fastify API, a Next.js web app, and a React Native (Expo) mobile app.
Teachers log a lesson in under 30 seconds; parents get a push notification and follow their child's
progress; an internal admin oversees it all.

## Architecture

```
                         packages/shared
                  (Zod schemas + types shared by all apps)
                                 │
        ┌────────────────────────┼────────────────────────┐
        ▼                        ▼                         ▼
   apps/web                 apps/api                  apps/mobile
   Next.js 14           Fastify + Prisma           React Native + Expo
   (App Router)         PostgreSQL · JWT           (web + mobile parity)
```

A single `packages/shared` defines the Zod schemas and TypeScript types consumed by the API, web and
mobile, so a contract change surfaces as a type error across every app instead of a runtime bug. This
is the backbone of the project: **one source of truth, three clients.**

## What's inside

| App | Stack | Role |
|---|---|---|
| **apps/api** | Fastify · Prisma · PostgreSQL · Zod · JWT (short-lived access token + refresh token) · rate-limiting | REST API, auth, push dispatch |
| **apps/web** | Next.js 14 (App Router) · TypeScript · Tailwind · React Hook Form · Sentry | Teacher / parent / admin web |
| **apps/mobile** | React Native · Expo (managed) · Expo Router · push, secure-store, image-picker | Teacher / parent mobile |
| **packages/shared** | Zod · TypeScript | Shared schemas, types and design tokens |

**Highlights**
- **Three roles** (teacher · parent · admin) with role-aware routing on web and mobile.
- **Auth**: short-lived JWT access tokens (15 min) plus a 7-day refresh token. The API returns the
  refresh token in the response body (it also sets it as an httpOnly cookie, but that cookie does not
  reach a web app hosted on another domain), and the web client keeps it in `localStorage`.
- **Push notifications** via Expo / FCM.
- **LGPD-aware** handling of minors' data (Brazil's data-protection law).
- **Typed end-to-end**: shared Zod contracts validate the same shapes on the server and both clients.

## Tech stack

TypeScript · Node.js 20 · Fastify · Prisma · PostgreSQL · Zod · Next.js 14 · Tailwind · React Native ·
Expo · JWT · Jest/Supertest · Playwright.

## Getting started

```bash
git clone https://github.com/Ewertonslv/liveaula.git
cd liveaula
pnpm install                 # monorepo install

cp apps/api/.env.example apps/api/.env   # fill in DB + secrets
pnpm --filter api prisma migrate dev     # set up the database

pnpm dev                     # run the apps in dev
```

Each app has its own scripts; see `apps/*/`. Environment samples live in `apps/api/.env.example`.

## Testing

```bash
pnpm test                              # API (Jest + Supertest), runs in CI
pnpm --filter @liveaula/web exec playwright test   # web e2e specs (run locally, need the API + DB up)
```

CI (`.github/workflows/ci.yml`) runs the API tests against Postgres, builds the web app and type-checks
the mobile app. There are no mobile e2e tests.

## Deployment

The web app is deployed by Vercel's Git integration on pushes to `main` (https://liveaula-web.vercel.app).
The API is not deployed anywhere right now, so the hosted web app has no backend behind it. The API has a
Dockerfile (`apps/api/Dockerfile`) and the mobile app builds with Expo EAS. Each app builds independently
from the monorepo.

---

Built as a showcase of a modern, type-safe full-stack monorepo (web + mobile + API sharing one contract).
