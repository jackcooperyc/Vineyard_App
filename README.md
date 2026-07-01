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

1. Push repo to GitHub
2. Create a [Neon](https://neon.tech) project and copy connection strings
3. Import repo in [Vercel](https://vercel.com)
4. Set environment variables:
   - `DATABASE_URL` — Neon **pooled** connection string
   - `DIRECT_URL` — Neon **direct** connection string
   - `AUTH_SECRET` — production secret (`openssl rand -base64 32`)
   - `AUTH_URL` — your Vercel production URL (e.g. `https://cev-app-puce.vercel.app`)
   - `NEXT_PUBLIC_MAPBOX_TOKEN` — Mapbox public token for the vineyard map
5. Deploy — `postinstall` runs `prisma generate` automatically
6. Run migrations against production: `npx prisma db push` (or `migrate deploy`)
7. Seed production once: `npm run db:seed`
8. Redeploy after adding or changing env vars (required for `NEXT_PUBLIC_*` at build time)

### Quick production sync (Vercel CLI)

```bash
npx vercel link
npx vercel deploy --prod

# Schema + seed (copy DATABASE_URL from Vercel dashboard — not available via env pull)
DATABASE_URL='postgres://...' ./scripts/sync-production-db.sh
```

Add or update env vars with:

```bash
printf '%s' 'your-value' | npx vercel env add VARIABLE_NAME production --force
```

Redeploy after changing `NEXT_PUBLIC_*` variables so they are included at build time.

## Documentation

- [Product vision](./docs/product-vision.md)
- [Architecture](./docs/architecture.md)
- [Domain model](./docs/domain-model.md)
- [Roadmap](./docs/roadmap.md)

## License

Private — Cooper Wine Company
