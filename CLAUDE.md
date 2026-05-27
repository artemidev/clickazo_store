# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A pnpm + Turborepo monorepo for a direct-to-consumer ecommerce store: a **Medusa v2 backend** (`apps/backend`) and a **Next.js 15 App Router storefront** (`apps/storefront`). Both pin `@medusajs/*` at `2.15.3` — keep this version aligned across the two apps when upgrading.

## Commands

Run from the repo root (Turborepo orchestrates the workspaces):

```bash
pnpm dev                 # run backend + storefront together
pnpm backend:dev         # backend only (Medusa on :9000, admin at :9000/app)
pnpm storefront:dev      # storefront only (Next.js on :8000)
pnpm build               # build all workspaces
pnpm lint                # lint all workspaces
pnpm test                # test all workspaces
pnpm backend:seed        # seed initial data into the backend
pnpm docker:up           # postgres + redis + backend + storefront via docker-compose
pnpm docker:down
```

Backend-specific (run inside `apps/backend`):

```bash
pnpm medusa db:migrate                              # run DB migrations
pnpm medusa user -e admin@test.com -p supersecret   # create an admin user
pnpm test:unit                                      # unit tests
pnpm test:integration:http                          # HTTP integration tests
pnpm test:integration:modules                       # module integration tests
```

Run a single backend test by passing a path/pattern to the jest invocation, e.g.
`TEST_TYPE=unit NODE_OPTIONS=--experimental-vm-modules jest path/to/file.spec.ts`.

## Setup essentials

- The storefront needs `NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY` (from admin → Settings → Publishable API key) in `apps/storefront/.env.local`. Without it, store API calls fail.
- Both apps load config from `.env` templates (`cp .env.template .env` / `.env.local`).
- Storefront defaults: backend at `http://localhost:9000`, default region `dk` (`NEXT_PUBLIC_DEFAULT_REGION`).

## Backend architecture (`apps/backend/src`)

Standard Medusa v2 customization layout — each directory is a Medusa extension point:

- `modules/` — custom commerce modules (data models + service).
- `api/admin/`, `api/store/` — custom REST routes (`route.ts` files). Store routes require the publishable key.
- `workflows/` — multi-step business logic (Medusa workflows/steps).
- `links/` — module links defining relationships across modules.
- `subscribers/` — event handlers; `jobs/` — scheduled jobs.
- `admin/` — admin dashboard UI extensions (widgets/pages), with `i18n/`.
- `migration-scripts/initial-data-seed.ts` — seed data (regions, tax, fulfillment, stock locations, products, inventory).

Config is `medusa-config.ts`; CORS, DB URL, and secrets all come from env vars. The admin `vite` block is customized for HMR inside Docker.

## Storefront architecture (`apps/storefront/src`)

Next.js App Router. Routing is locale/region-prefixed: `app/[countryCode]/...`.

- `lib/config.ts` — the singleton Medusa JS SDK (`sdk`). `fetch` is wrapped to inject an `x-medusa-locale` header. All backend calls go through this SDK.
- `lib/data/*.ts` — server-side data access, one file per domain (cart, products, regions, customer, orders, etc.). These are `"use server"` actions using `sdk`, Medusa auth headers, and Next.js cache tags (`getCacheTag`/`getCacheOptions` + `revalidateTag`). Add new backend-data access here rather than calling `sdk` from components.
- `lib/util/`, `lib/hooks/`, `lib/context/` — helpers, hooks, React context.
- `modules/<domain>/` — UI feature folders (cart, checkout, products, account, order, layout, etc.). Components import data via the `lib/data` layer.
- Path aliases: `@lib/*`, `@modules/*` (see `tsconfig.json`).

Note: `next.config.js` sets `eslint.ignoreDuringBuilds` and `typescript.ignoreBuildErrors` — type/lint errors do not fail the storefront build, so run `pnpm lint` explicitly.

## Docker

`docker-compose.yml` brings up postgres (`:5432`), redis (`:6379`), the backend (`:9000`, admin HMR `:5173`), and the storefront (`:8000`). On startup `start.sh` runs migrations + seed before `medusa develop`; `start-storefront.sh` runs the Next.js dev server. Both apps mount the repo and run in dev mode.
