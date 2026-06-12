# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

A pnpm + Turborepo monorepo for a direct-to-consumer ecommerce store: a **Medusa v2 backend** (`apps/backend`) and a **Next.js 15 App Router storefront** (`apps/storefront`). Both pin `@medusajs/*` at `2.15.3` — keep this version aligned across the two apps when upgrading. A newer **TanStack Start storefront** (`apps/storefrontv2`) is also under active development following a hexagonal/MVVM architecture (see "Storefrontv2 architecture" below).

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

## Storefrontv2 architecture (`apps/storefrontv2/src`)

A **TanStack Start** storefront (TanStack Router file-based routing, Vitest, Biome, shadcn) organized in **hexagonal / MVVM layers**. The top-level folders *are* the architecture — keep new code inside the matching layer instead of adding new top-level buckets. The dependency rule points inward: `routes → presentation → application → domain`; `infrastructure` implements the application's ports; `di` is the composition root wiring them together.

- `domain/` — pure business rules, schemas, and value objects (`auth`, `cart`, `checkout`, `customer`, `product`, `shared`). No imports from other layers.
- `application/` — the use-case core. `ports/` (repository contracts), `use-cases/` (commands; factories taking `RepoDeps`), `queries/` (TanStack Query `queryOptions` read models — called directly from route loaders during SSR), plus `cache.ts` and `query-keys.ts`. Reads go through queries; **commands** go through DI → use case → repository.
- `infrastructure/` — adapters. `medusa/` (SDK client + raw fetchers), `server/` (TanStack Start server functions), `adapters/` (port implementations), `medusa-error.ts`.
- `presentation/` — all UI. `pages/<page>/` holds a `*-page.tsx` + colocated `*-view-model.ts` (and a `components/` subfolder for single-page components); `features/<domain>/` holds cross-page/feature components; `shared-view-models/`, `providers/`, `hooks/`, and app-shell `components/` (e.g. `localized-link`, error boundaries).
- `design-system/` — domain-agnostic primitives: `ui/` (shadcn — see `components.json` aliases), `brand/`, `form/`. Must not import from `presentation`/`domain`.
- `di/` — composition root (`container.ts`, `context.tsx`, `types.ts`). Only this layer imports `infrastructure/adapters`. View models pull commands via `useUseCases()`.
- `shared/` — cross-cutting `env.ts` / `utils.ts`. `routes/` — TanStack file-based routes (framework-mandated location; keep thin, delegate to `presentation`).

Path aliases: `@/*` and `#/*` → `src/*` (see `tsconfig.json`). Verify with `npx tsc --noEmit`, `npx vitest run`, and `npx biome check src`.

## Docker

**Development** — `docker-compose.yml` brings up postgres (`:5432`), redis (`:6379`), the backend (`:9000`, admin HMR `:5173`), and the storefront (`:8000`). Both services build from `docker/dev.Dockerfile` (shared dev image), mount the repo, and run in dev mode. Entrypoints: `scripts/dev-backend.sh` (migrate + seed + `medusa develop`) and `scripts/dev-storefront.sh` (`next dev`).

**Production** — one multi-stage image per app: `docker/backend.Dockerfile` and `docker/storefront.Dockerfile`.
- Backend: stage 1 builds the workspace and runs `medusa build` (output in `apps/backend/.medusa/server`); stage 2 copies *only* that output to a clean `/app` (outside the pnpm workspace) and runs `npm install` there — required because `.medusa` is excluded from the workspace, so installing in place leaves the `medusa` binary missing. Entrypoint `scripts/backend-start.sh` is role-aware (see below).
- Storefront: built with Next.js `output: "standalone"`; `NEXT_PUBLIC_*` vars must be passed as build args (inlined at build time). Entrypoint `scripts/storefront-start.sh` runs the standalone `server.js`.
- CI (`.github/workflows/deploy-production.yml`, on `v*` tags) builds and pushes both images (`clickazo-backend`, `clickazo-storefront`) and triggers Dokploy webhooks.

### Backend server/worker split (production)

Following Medusa's [worker mode guidance](https://docs.medusajs.com/learn/production/worker-mode), production runs **two instances from the same backend image**, differentiated only by runtime env vars (no second Dockerfile):

| Instance | `MEDUSA_WORKER_MODE` | `DISABLE_MEDUSA_ADMIN` | Role |
|----------|----------------------|------------------------|------|
| server   | `server`             | `false`                | HTTP/API + admin dashboard |
| worker   | `worker`             | `true`                 | events, scheduled jobs, workflows |

- Both read these via `medusa-config.ts` (`projectConfig.workerMode`, `admin.disable`) and share the same `DATABASE_URL` and `REDIS_URL` (the Redis modules in `medusa-config.ts` are what make the split work).
- `scripts/backend-start.sh` runs `predeploy` (migrations) **only** when not in worker mode, so migrations execute exactly once (on the server instance).
- Local dev stays in `shared` mode (single instance) — no env vars needed; defaults preserve current behavior.
- Deployment: CI triggers two Dokploy webhooks — `DOKPLOY_BACKEND_WEBHOOK_URL` (server) and `DOKPLOY_WORKER_WEBHOOK_URL` (worker). The worker service must be created in Dokploy reusing the backend image with the worker env vars above.

## Search (Meilisearch)

Product/category search is powered by `@rokmohar/medusa-plugin-meilisearch`, registered in `apps/backend/medusa-config.ts` (`plugins` array). It uses the **single-index `field-suffix` i18n strategy** (`i18n: { strategy: "field-suffix", languages: ["en","es"], defaultLanguage: "es" }`): every product/category lives in ONE index (`products` / `categories`). **Spanish is the default/base language**, so the base fields (`title`, `description`, `name`) hold the Spanish text, and each translation from Medusa's **native Translation module** (`featureFlags.translation` + `@medusajs/medusa/translation`; helper `apps/backend/src/utils/translations.ts`) is added as a language-suffixed sibling — English surfaces as `title_en` / `description_en` / `name_en`. Until English translations are entered in admin, the `_en` fields are simply absent and English search falls back to the Spanish base text. (Do **not** reference `_es` fields — Spanish is the base, so they are never produced.)

> ⚠️ Do **not** switch back to the plugin's `separate-index` strategy: in v1.4.3 its sync step writes the default-language documents into *both* `<index>_<lang>` indexes and the store route merges across them, so every product comes back **twice** (and the secondary-language search returns nothing). The single-index strategy makes duplicate results structurally impossible. If you ever change strategy, delete the stale Meilisearch indexes and re-sync.

- **Semantic / vector search** is Meilisearch's native OpenAI embedder, enabled via the plugin's `vectorSearch` option (`provider: "openai"`, `text-embedding-3-small`, `dimensions: 1536`; needs `OPENAI_API_KEY` and Meilisearch ≥ v1.13 where AI search is GA). The plugin creates ONE embedder named `default` per index whose document template concatenates `embeddingFields`; we set `embeddingFields: ["title","description","title_en","description_en"]` so a single **multilingual** vector covers both Spanish (base) and English (`_en`). The storefront issues a **hybrid** query (`semanticSearch=true&semanticRatio=0.5`, plus the active `language`). Note: the OpenAI embedder truncates the combined template to 500 bytes, so very long ES+EN descriptions may be clipped (titles are safe).
- **Indexing** is event-driven (plugin subscribers) plus a scheduled job (`meilisearch-products-index`) that runs a full sync on boot. To force a re-sync: `POST /admin/meilisearch/sync`.
- **Storefront** search is two-stage (`apps/storefrontv2/src/infrastructure/medusa/search.ts`): (1) the plugin store route `GET /store/meilisearch/products-hits` returns the relevance-ranked **product ids** (no direct browser→Meilisearch access), with `semanticSearch`/`semanticRatio`/`language` passed through from `infrastructure/server/search.ts`; (2) those ids are hydrated through `GET /store/products?id[]=…&region_id=…` so each result carries the same region-aware `calculated_price`, localized title, and category as a normal product card (pricing never lives in the index). Frontend code: `infrastructure/{medusa,server}/search.ts`, `application/queries/search.queries.ts`, the inline header dropdown (`presentation/features/search/search-box.tsx` + `search-box-view-model.ts` + `use-recent-searches.ts`, popular terms in `domain/search/`), the full results page `presentation/pages/search/`, and the `/$countryCode/_storefront/search` route.
- **Env vars** `MEILISEARCH_HOST`, `MEILISEARCH_API_KEY`, and `OPENAI_API_KEY` (for the embedder) are required on **both** the server and worker instances in production (the worker runs the indexing subscribers/job and so generates embeddings; the server serves the store route). In docker dev they point at the bundled `meilisearch` service (`docker-compose.yml`), which also includes a `meilisearch-ui` dashboard on `:24900`.
