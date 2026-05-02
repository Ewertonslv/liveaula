# Multi-stage build for liveaula API in pnpm monorepo
# Build context: repo root (Railway uses dockerfilePath = apps/api/Dockerfile)

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat openssl openssl-dev
RUN npm install -g pnpm@10.33.2
WORKDIR /app

# ─── Stage 1: install all workspace deps ───────────────────────────────────
FROM base AS deps
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared/package.json ./packages/shared/
COPY apps/api/package.json ./apps/api/
COPY apps/web/package.json ./apps/web/
COPY apps/mobile/package.json ./apps/mobile/
RUN pnpm install --no-frozen-lockfile --ignore-scripts

# ─── Stage 2: build (source first, then deps to preserve symlinks) ─────────
FROM base AS build
WORKDIR /app
COPY package.json pnpm-workspace.yaml pnpm-lock.yaml ./
COPY packages/shared ./packages/shared
COPY apps/api ./apps/api
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules

# Build shared → dist + patch package.json so prod resolves to compiled JS
WORKDIR /app/packages/shared
RUN pnpm run build
RUN node -e "const p=require('./package.json');p.main='./dist/index.js';p.types='./dist/index.d.ts';p.exports={'.':{'types':'./dist/index.d.ts','default':'./dist/index.js'}};require('fs').writeFileSync('./package.json',JSON.stringify(p,null,2))"

# Build the API
WORKDIR /app/apps/api
RUN pnpm exec prisma generate
RUN pnpm build

# ─── Stage 3: runtime — preserve full monorepo layout for pnpm symlinks ────
FROM base AS runner
WORKDIR /app
ENV NODE_ENV=production

# Workspace metadata + the .pnpm store (root node_modules)
COPY --from=build /app/package.json /app/pnpm-workspace.yaml /app/pnpm-lock.yaml ./
COPY --from=build /app/node_modules ./node_modules

# Shared package (with compiled dist + patched package.json)
COPY --from=build /app/packages/shared/package.json ./packages/shared/
COPY --from=build /app/packages/shared/dist ./packages/shared/dist
COPY --from=build /app/packages/shared/node_modules ./packages/shared/node_modules

# API package (compiled dist + symlinked node_modules + Prisma artifacts)
COPY --from=build /app/apps/api/package.json ./apps/api/
COPY --from=build /app/apps/api/dist ./apps/api/dist
COPY --from=build /app/apps/api/prisma ./apps/api/prisma
COPY --from=build /app/apps/api/node_modules ./apps/api/node_modules

WORKDIR /app/apps/api
EXPOSE 3000
CMD ["sh", "-c", "pnpm exec prisma migrate deploy && node dist/server.js"]
