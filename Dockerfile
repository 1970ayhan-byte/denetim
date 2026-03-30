# Coolify / self-hosted: Next.js standalone + Prisma (PostgreSQL)
FROM node:20-bookworm-slim AS base
WORKDIR /app

# ── deps ─────────────────────────────────────────────────────────
FROM base AS deps
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY package.json ./
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
RUN corepack enable && corepack prepare yarn@1.22.22 --activate \
  && yarn install --network-timeout 600000

# ── build ────────────────────────────────────────────────────────
FROM base AS builder
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/*
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV PUPPETEER_SKIP_CHROMIUM_DOWNLOAD=true
# prisma generate does not connect; placeholder satisfies schema env("DATABASE_URL")
ENV NEXT_TELEMETRY_DISABLED=1
ENV DATABASE_URL="postgresql://build:build@127.0.0.1:5432/build_placeholder"
# Coolify / build: client bundle içine doğru origin (ARG ile override edilebilir)
ARG NEXT_PUBLIC_BASE_URL=https://anaokuludenetim.com
ENV NEXT_PUBLIC_BASE_URL=${NEXT_PUBLIC_BASE_URL}
RUN yarn prisma generate && yarn build

# ── run ──────────────────────────────────────────────────────────
FROM base AS runner
RUN apt-get update -y && apt-get install -y openssl ca-certificates && rm -rf /var/lib/apt/lists/* \
  && groupadd --system --gid 1001 nodejs \
  && useradd --system --uid 1001 --gid nodejs nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3030
ENV HOSTNAME=0.0.0.0

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs
EXPOSE 3030
CMD ["node", "server.js"]
