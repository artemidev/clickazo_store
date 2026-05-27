# syntax=docker/dockerfile:1
#
# Production image for the Next.js storefront (@dtc/storefront).
#
# NEXT_PUBLIC_* variables are inlined into the bundle at BUILD time, so they must
# be provided as build args (not just at runtime). The build also runs
# check-env-variables.js, which hard-fails if NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
# is missing. Runtime uses Next.js standalone output for a small image.

# -----------------------------------------------------------------------------
# Stage 1 — builder
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /workspace

RUN npm install -g pnpm@10.11.1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/storefront/package.json ./apps/storefront/

RUN pnpm install --frozen-lockfile

COPY . .

# Public env vars — required at build time (inlined into the client bundle)
ARG NEXT_PUBLIC_MEDUSA_BACKEND_URL
ARG NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_DEFAULT_REGION=dk
ARG NEXT_PUBLIC_BASE_URL
ARG NEXT_PUBLIC_STRIPE_KEY
ENV NEXT_PUBLIC_MEDUSA_BACKEND_URL=$NEXT_PUBLIC_MEDUSA_BACKEND_URL \
    NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY=$NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY \
    NEXT_PUBLIC_DEFAULT_REGION=$NEXT_PUBLIC_DEFAULT_REGION \
    NEXT_PUBLIC_BASE_URL=$NEXT_PUBLIC_BASE_URL \
    NEXT_PUBLIC_STRIPE_KEY=$NEXT_PUBLIC_STRIPE_KEY

RUN pnpm --filter=@dtc/storefront build

# -----------------------------------------------------------------------------
# Stage 2 — runtime: Next.js standalone server.
# With output: "standalone" + outputFileTracingRoot, the bundle keeps the
# monorepo layout, so the server entry is apps/storefront/server.js.
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runtime

ENV NODE_ENV=production \
    PORT=8000 \
    HOSTNAME=0.0.0.0

WORKDIR /app

COPY --from=builder /workspace/apps/storefront/.next/standalone ./
COPY --from=builder /workspace/apps/storefront/.next/static ./apps/storefront/.next/static
COPY --from=builder /workspace/apps/storefront/public ./apps/storefront/public

COPY scripts/storefront-start.sh ./storefront-start.sh
RUN chmod +x ./storefront-start.sh

EXPOSE 8000

ENTRYPOINT ["./storefront-start.sh"]
