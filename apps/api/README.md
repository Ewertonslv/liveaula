# liveaula API

Fastify + Prisma + PostgreSQL backend.

## Setup

```bash
cp .env.example .env
# Fill in DATABASE_URL, JWT_SECRET, etc.
pnpm install
cd apps/api && npx prisma migrate dev
pnpm --filter @liveaula/api dev
```

## Environment Variables

| Variable | Description | Required |
|---|---|---|
| DATABASE_URL | PostgreSQL connection string | ✅ |
| JWT_SECRET | Min 32 chars | ✅ |
| JWT_REFRESH_SECRET | Min 32 chars | ✅ |
| ASAAS_API_KEY | Asaas sandbox/prod key | ✅ |
| ASAAS_WEBHOOK_TOKEN | Webhook validation token | ✅ |
| CLOUDINARY_CLOUD_NAME | Cloudinary config | ✅ |
| CLOUDINARY_API_KEY | Cloudinary config | ✅ |
| CLOUDINARY_API_SECRET | Cloudinary config | ✅ |
| INTERNAL_SECRET | Cron protection secret | ✅ |
| SENTRY_DSN | Error monitoring | optional |

## API Endpoints

### Auth
- POST /auth/register — Register professor or parent (with invite token)
- POST /auth/login — Login (dual transport: cookie web + body mobile)
- POST /auth/refresh — Refresh access token
- POST /auth/logout — Logout

### Students
- GET /students — List professor's students
- POST /students — Create student (PROFESSOR)
- GET /students/:id — Student detail (PROFESSOR or PARENT with LGPD consent)
- PATCH /students/:id — Update student (PROFESSOR, ownership required)

### Lessons
- POST /lessons — Register lesson (PROFESSOR, triggers FCM push)
- GET /lessons — List professor's lessons (cursor-based)
- GET /lessons/student/:studentId — Student lessons (PROFESSOR or PARENT)
- GET /lessons/:id — Lesson detail

### Invitations
- POST /invitations — Send parent invite (PROFESSOR)
- GET /invitations — List professor's invites
- GET /invitations/:token — Get invite data (public)

### Me
- GET /me — My profile
- PATCH /me — Update profile
- GET /me/students — My students
- POST /me/device-tokens — Register push token
- DELETE /me/device-tokens/:token — Invalidate push token
- POST /me/cloudinary-signature — Get upload signature

### Subscription (PARENT)
- GET /subscription — Current subscription
- POST /subscription — Subscribe
- GET /subscription/payments — Payment history

### Webhooks
- POST /webhooks/asaas — Asaas webhook (token-validated)

### Admin (ADMIN role)
- GET /admin/users — List users with filters
- PATCH /admin/users/:id/status — Toggle user active
- GET /admin/subscriptions — List subscriptions
- GET /admin/metrics — DAU, MAU, conversion rate

### Consent
- POST /consent — Log LGPD consent (idempotent)

### Internal (cron)
- POST /internal/sync-professor-plans — Sync professor plan status
