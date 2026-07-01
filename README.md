# Cooper Estate Vineyard Management

Operational command center for Cooper Estate Vineyards — a block-centered vineyard operations platform built with Next.js, Prisma, and PostgreSQL.

## Features (Sprint 0–1)

- Authenticated app shell with mobile bottom nav and desktop sidebar
- Vineyard block directory with varietal and planting details
- Block detail pages with notes and task preview
- Dashboard summary cards
- Placeholder pages for tasks, equipment, irrigation, and map
- Prisma schema for full domain model (tasks, equipment, irrigation ready for later sprints)
- Seed data for 8 Cooper Estate sample blocks on Red Mountain, WA

## Stack

- **Next.js 16** (App Router) + TypeScript
- **PostgreSQL** via [Neon](https://neon.tech) (production) or Prisma local dev (development)
- **Prisma 7** ORM with `@prisma/adapter-pg`
- **Auth.js v5** (credentials login)
- **Tailwind CSS** + **shadcn/ui**
- **Mapbox GL JS** (planned Sprint 5)

## Getting started

### Prerequisites

- Node.js 20+
- PostgreSQL database (Neon recommended for production)

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (Neon pooled URL for app) |
| `DIRECT_URL` | Direct connection for Prisma migrations (Neon) |
| `AUTH_SECRET` | Random secret — `openssl rand -base64 32` |
| `AUTH_URL` | App URL — `http://localhost:3000` locally |

**Local development with Prisma dev:**

```bash
npx prisma dev          # starts local Postgres
npx prisma db push      # apply schema
npm run db:seed         # seed sample data
```

Use the Postgres URL printed by `prisma dev` (typically `postgres://postgres:postgres@localhost:51214/template1`).

### 3. Run the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

**Seed login:** `admin@cooperestate.com` / `cooper2026`

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Production build |
| `npm run db:push` | Push schema to database |
| `npm run db:seed` | Seed Cooper Estate sample data |
| `npm run db:studio` | Open Prisma Studio |

## Project structure

```
docs/           Product and architecture documentation
prisma/         Schema and seed data
src/app/        Next.js routes
src/components/ UI components by domain
src/domains/    Business logic and queries
src/lib/        Auth, database, utilities
```

See [PROJECT_START.md](./PROJECT_START.md) for the full product brief and [docs/roadmap.md](./docs/roadmap.md) for the sprint plan.

## Deployment (Vercel + Neon)

Production: **https://cev-app-puce.vercel.app** (`jackcooperyc-6691s-projects/cev-app`)

### Provision Neon (recommended: Vercel integration)

If your Vercel team uses the [Neon marketplace integration](https://vercel.com/integrations/neon), provision from the linked project:

```bash
npx vercel link --project cev-app
npx vercel integration add neon --name cev-app-db -m region=pdx1 -m auth=false --plan free_v3
```

If `DATABASE_URL` already exists, override it after provisioning (see below). Use `pdx1` (US West) for Cooper Estate latency.

Alternatively, create a project at [neon.tech](https://neon.tech) and copy connection strings from the dashboard.

### Environment variables

Set on **production**, **preview**, and **development** in Vercel:

| Variable | Value |
|----------|-------|
| `DATABASE_URL` | Neon **pooled** URL (`-pooler` host) with `?sslmode=verify-full` |
| `DIRECT_URL` | Neon **direct** URL (non-pooler host) with `?sslmode=verify-full` |
| `AUTH_SECRET` | `openssl rand -base64 32` (do not rotate unless compromised) |
| `AUTH_URL` | `https://cev-app-puce.vercel.app` |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | Mapbox public token |

```bash
printf '%s' 'postgresql://...-pooler...?sslmode=verify-full' | npx vercel env add DATABASE_URL production --force
printf '%s' 'postgresql://...direct...?sslmode=verify-full' | npx vercel env add DIRECT_URL production --force
```

Redeploy after changing env vars (required for `NEXT_PUBLIC_*` at build time).

### Deploy and sync schema + seed

```bash
npx vercel deploy --prod --yes

# Schema + seed — copy URLs from Vercel dashboard (sensitive vars are not in env pull)
DATABASE_URL='postgresql://...-pooler...?sslmode=verify-full' \
DIRECT_URL='postgresql://...direct...?sslmode=verify-full' \
  ./scripts/sync-production-db.sh
```

`postinstall` runs `prisma generate` on Vercel automatically. The sync script backs up local `.env` so localhost credentials are not used.

### Neon CLI (optional)

```bash
npx neonctl auth                    # browser login (one-time)
npx neonctl projects list --org-id <org-id>
npx neonctl connection-string --project-id <id> --pooled --ssl verify-full
npx neonctl connection-string --project-id <id> --ssl verify-full   # direct
```

Vercel-managed Neon orgs cannot create projects via `neonctl projects create`; use `vercel integration add neon` instead.

## Documentation

- [Product vision](./docs/product-vision.md)
- [Architecture](./docs/architecture.md)
- [Domain model](./docs/domain-model.md)
- [Roadmap](./docs/roadmap.md)

## License

Private — Cooper Wine Company
