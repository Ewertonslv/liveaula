# Multi-stage build for liveaula API in pnpm monorepo
# Build context: repo root (Railway sets this when dockerfilePath = apps/api/Dockerfile)

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl openssl-dev
RUN npm install -g pnpm@10.33.2
WORKDIR /app

# ─── Stage 1: install all workspace deps for the API ───────────────────────
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/
# Install everything (filtering caused transitive deps of shared to be missing — zod, etc.)
# Use --ignore-scripts to skip postinstall (Prisma generate runs explicitly later)
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# ─── Stage 2: build TypeScript (shared first, then api) ────────────────────
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api

# Build shared package to dist/ AND patch its package.json so production resolves
# to compiled JS instead of the .ts source (which Node can't run).
WORKDIR /app/packages/shared
RUN pnpm run build
RUN node -e "const p=require('./package.json');p.main='./dist/index.js';p.types='./dist/index.d.ts';p.exports={'.':{'types':'./dist/index.d.ts','default':'./dist/index.js'}};require('fs').writeFileSync('./package.json',JSON.stringify(p,null,2))"

# Build the API
WORKDIR /app/apps/api
RUN pnpm exec prisma generate
RUN pnpm build

# ─── Stage 3: lean runtime image ───────────────────────────────────────────
FROM node:20-alpine AS runner
RUN apk add --no-cache libc6-compat openssl
RUN npm install -g pnpm@10.33.2
WORKDIR /app
ENV NODE_ENV=production

# API artifacts
COPY --from=build /app/apps/api/dist ./dist
COPY --from=build /app/apps/api/node_modules ./node_modules
COPY --from=build /app/apps/api/prisma ./prisma
COPY --from=build /app/apps/api/package.json .

# Shared package compiled artifacts (replace symlinked .ts source with built JS)
COPY --from=build /app/packages/shared/dist ./node_modules/@liveaula/shared/dist
COPY --from=build /app/packages/shared/package.json ./node_modules/@liveaula/shared/package.json

EXPOSE 3000
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/server.js"]
