# syntax=docker/dockerfile:1
#
# Shared development image (backend + storefront) used by docker-compose.yml.
# The repo is bind-mounted over /server at runtime, so this only needs the
# workspace dependencies installed; the per-service entrypoint is set in compose.

FROM node:20-alpine

WORKDIR /server

RUN npm install -g pnpm@10.11.1

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml turbo.json .npmrc ./
COPY apps/backend/package.json ./apps/backend/
COPY apps/storefront/package.json ./apps/storefront/

RUN pnpm install --frozen-lockfile

COPY . .

EXPOSE 9000 5173 8000

ENTRYPOINT ["sh", "scripts/dev-backend.sh"]
