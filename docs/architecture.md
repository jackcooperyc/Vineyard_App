# Architecture

## Goals

Build a production-grade, mobile-friendly vineyard operations platform centered on blocks as the primary entity. Ship in phases; avoid overengineering v1.

## System components

```
┌─────────────────────────────────────────────────────────┐
│  Browser (mobile + desktop)                             │
│  Next.js App Router · React · Tailwind · shadcn/ui      │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Next.js Server                                         │
│  Server Components · Server Actions · API Routes        │
│  Auth.js middleware · Domain services (src/domains/)    │
└──────────────────────────┬──────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────┐
│  Prisma ORM → Neon PostgreSQL                           │
└─────────────────────────────────────────────────────────┘
```

## Stack

| Layer | Technology |
|-------|------------|
| Framework | Next.js 15 App Router, TypeScript |
| UI | Tailwind CSS, shadcn/ui |
| Database | Neon PostgreSQL (pooled `DATABASE_URL` + `DIRECT_URL`) |
| ORM | Prisma |
| Auth | Auth.js v5 (`next-auth@beta`) with Prisma adapter |
| Maps | Mapbox GL JS (Sprint 5; placeholder in Sprint 1) |
| Deploy | Vercel |
| VCS | GitHub |

## Folder conventions

Domain logic lives in `src/domains/<module>/` (queries, validators, types). Route pages in `src/app/(app)/` stay thin and delegate to domain services. Shared UI in `src/components/shared/`.

## Data flow

1. User authenticates via Auth.js credentials provider
2. Middleware protects `(app)` routes
3. Server Components call domain queries (e.g. `getBlocks()`)
4. Mutations use Server Actions with Zod validation
5. Prisma reads/writes Neon Postgres

## Block as anchor

Every operational entity carries a `blockId` (directly or via relation):

- `Planting` → `Block`
- `Task` → `Block`
- `IrrigationSchedule` / `IrrigationRecord` → `Block`
- `Note` → `Block` (optional)
- `MapFeature` → `Block` (1:1)

## Auth

- Credentials provider (email + password) for internal team
- No public signup in v1
- `User.role` enum stored for future RBAC
- Session strategy: JWT (Auth.js default with credentials)

## Map architecture (planned — Sprint 5)

1. Store block boundaries as GeoJSON in `MapFeature.geometry`
2. Store `centerLat` / `centerLng` for labels and fly-to
3. Mapbox `GeoJSONSource` loads all block polygons
4. Click handler resolves `blockId` from feature properties
5. `Sheet` component (slide-up drawer) shows block summary + quick actions
6. Future 3D: same GeoJSON source, enable Mapbox terrain + pitch

Sprint 1 ships a static map placeholder page; no Mapbox token required yet.

## Deployment

### Local development

```bash
cp .env.example .env
# Fill DATABASE_URL, DIRECT_URL, AUTH_SECRET
npm install
npx prisma migrate dev
npx prisma db seed
npm run dev
```

### Vercel

- Connect GitHub repo
- Set environment variables: `DATABASE_URL`, `DIRECT_URL`, `AUTH_SECRET`, `AUTH_URL`
- Preview deploys on every PR; production on `main`

# Prisma 7 requires the PostgreSQL driver adapter at runtime:
#
# ```ts
# import { PrismaPg } from "@prisma/adapter-pg";
# const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
# const db = new PrismaClient({ adapter });
# ```
#
# Neon: use pooled URL for DATABASE_URL, direct URL for migrations (DIRECT_URL).

## Assumptions

- Cooper Estate has dozens of blocks (exact count TBD Sprint 7)
- Block geometry starts as placeholder polygons; real GIS in Sprint 7
- v1 auth is team-internal only
- Reporting deferred to Sprint 8
- Offline: UX patterns Sprint 6; full PWA deferred

## Open questions

- Exact block count and spreadsheet format for import
- Whether rootstock/row spacing are required v1 fields
- Highest-priority mobile workflows (likely quick task log, irrigation record)
- Existing sensor platforms for Sprint 8 integration

## Tradeoffs

| Decision | Rationale |
|----------|-----------|
| Server Actions over REST API | Simpler v1; fewer files; good fit for form mutations |
| JWT sessions | Works with credentials provider; no DB session lookup per request |
| Schema all entities upfront | Tasks/equipment/irrigation UI in later sprints but DB ready |
| Map placeholder in Sprint 1 | Unblocks block work without Mapbox token dependency |
