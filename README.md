# liveaula

**A full-stack EdTech platform for private lessons** — a TypeScript monorepo with a shared, end-to-end
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
mobile — so a contract change surfaces as a type error across every app instead of a runtime bug. This
is the backbone of the project: **one source of truth, three clients.**

## What's inside

| App | Stack | Role |
|---|---|---|
| **apps/api** | Fastify · Prisma · PostgreSQL · Zod · JWT (short-lived access + httpOnly refresh) · rate-limiting | REST API, auth, push dispatch |
| **apps/web** | Next.js 14 (App Router) · TypeScript · Tailwind · React Hook Form · Sentry | Teacher / parent / admin web |
| **apps/mobile** | React Native · Expo (managed) · Expo Router · push, secure-store, image-picker | Teacher / parent mobile |
| **packages/shared** | Zod · TypeScript | Shared schemas, types and design tokens |

**Highlights**
- **Three roles** (teacher · parent · admin) with role-aware routing on web and mobile.
- **Auth** built for cross-site use: short-lived JWT access tokens + httpOnly refresh.
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
pnpm test          # API (Jest + Supertest)
# web: Playwright   ·   mobile: Detox
```

## Deployment targets

API on **Railway**, web on **Vercel**, mobile via **Expo EAS** — each app deploys independently from the
monorepo.

---

Built as a showcase of a modern, type-safe full-stack monorepo (web + mobile + API sharing one contract).
