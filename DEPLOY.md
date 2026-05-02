# Deploy Checklist — liveaula

## Pre-deploy

- [ ] All environment variables set in Railway (API) and Vercel (Web)
- [ ] `ASAAS_WEBHOOK_TOKEN` is non-empty and registered in Asaas dashboard
- [ ] `JWT_SECRET` is at least 32 chars and matches between API and Web
- [ ] Prisma migrations run: `npx prisma migrate deploy`
- [ ] Seed subjects: `npx prisma db seed` (first deploy only)
- [ ] EAS build triggered: `eas build --platform all --profile production`

## Railway (API)

1. Connect repo, set root directory to `apps/api`
2. Set build command: `npx prisma generate && npm run build`
3. Set start command: `node dist/server.js`
4. Add environment variables from `.env.example`
5. Enable auto-deploy on main branch

## Vercel (Web)

1. Connect repo, set root directory to `apps/web`
2. Framework preset: Next.js
3. Add environment variables: `NEXT_PUBLIC_API_URL`, `JWT_SECRET`
4. Enable auto-deploy on main branch

## Expo EAS (Mobile)

1. `eas login`
2. `eas build --platform all --profile production`
3. Submit to stores: `eas submit --platform all`

## Post-deploy verification

- [ ] `GET /health` returns `{ status: 'ok' }`
- [ ] Professor can register and login
- [ ] Push notification received within 5s of lesson creation
- [ ] Asaas webhook receiving events
- [ ] LGPD consent logged in database
