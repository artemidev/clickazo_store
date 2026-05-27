# syntax=docker/dockerfile:1
#
# Production image for the Medusa backend (@dtc/backend).
#
# Why two stages: `medusa build` emits a self-contained app to
# apps/backend/.medusa/server. Its production dependencies CANNOT be installed
# in place, because that folder lives inside the pnpm workspace (and is excluded
# from it in pnpm-workspace.yaml), so `pnpm install` there is a no-op and the
# `medusa` binary never appears. The fix is to copy ONLY that output into a
# clean directory with no workspace above it, then install there.

# -----------------------------------------------------------------------------
# Stage 1 — builder: install the full workspace and compile the backend.
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /workspace

RUN npm install -g pnpm@10.11.1

# Manifests first for better layer caching
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/storefront/package.json ./apps/storefront/

RUN pnpm install --frozen-lockfile

# Sources + build (devDeps are needed for the build step)
COPY . .
RUN pnpm --filter=@dtc/backend build

# -----------------------------------------------------------------------------
# Stage 2 — runtime: only the build output, installed outside the workspace.
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runtime

ENV NODE_ENV=production

WORKDIR /app

# The self-contained server produced by `medusa build`
COPY --from=builder /workspace/apps/backend/.medusa/server ./

# No pnpm-workspace.yaml above /app → this creates a real local node_modules
# with the `medusa` binary linked. --omit=dev keeps it production-only.
RUN npm install --omit=dev

COPY scripts/backend-start.sh ./backend-start.sh
RUN chmod +x ./backend-start.sh

EXPOSE 9000

ENTRYPOINT ["./backend-start.sh"]
