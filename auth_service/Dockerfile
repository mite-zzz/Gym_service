# ─────────────────────────────────────────────
#  Gym Auth Service — Dockerfile
#  Multi-stage build for a lean production image
# ─────────────────────────────────────────────

# ── Stage 1: Dependencies ──────────────────────
FROM node:20-alpine AS deps

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --frozen-lockfile

# Generate Prisma Client
RUN npx prisma generate


# ── Stage 2: Builder ───────────────────────────
FROM node:20-alpine AS builder

WORKDIR /app
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/prisma ./prisma

COPY tsconfig.json ./
COPY src ./src

RUN npm run build


# ── Stage 3: Production runtime ────────────────
FROM node:20-alpine AS runner

RUN apk add --no-cache openssl \
 && addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 gymauth

WORKDIR /app

ENV NODE_ENV=production

COPY --from=deps    --chown=gymauth:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=gymauth:nodejs /app/dist         ./dist
COPY --from=builder --chown=gymauth:nodejs /app/prisma       ./prisma
COPY --chown=gymauth:nodejs package.json ./

RUN mkdir -p logs && chown gymauth:nodejs logs

USER gymauth

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -qO- http://localhost:3000/health || exit 1

# prisma db push syncs schema directly — no migration history needed
CMD ["sh", "-c", "echo '⏳ Syncing database schema...' && npx prisma db push --accept-data-loss && echo '✅ Schema ready' && node dist/index.js"]