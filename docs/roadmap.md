# Roadmap

## Phases

| Phase | Goal | Status |
|-------|------|--------|
| 0 | Product context and docs | In progress |
| 1 | Domain model and Prisma schema | In progress |
| 2 | Platform bootstrap (Next.js, Neon, Auth, Vercel) | In progress |
| 3 | Foundation UX (shell, blocks) | Planned |
| 4 | Map-centric operations | Sprint 5 |
| 5 | Operational modules (tasks, equipment, irrigation) | Sprints 2–4 |
| 6 | Real vineyard data import | Sprint 7 |
| 7 | Intelligence layer (3D, sensors, reporting) | Sprint 8 |

## Sprint backlog

### Sprint 0 — Context and platform bootstrap

- [x] Documentation (`/docs`, `PROJECT_START.md`)
- [x] Next.js scaffold with TypeScript and Tailwind
- [x] Prisma + Neon configuration
- [x] Auth.js setup
- [x] GitHub repo and Vercel connection docs

### Sprint 1 — Data foundation and app shell

- [x] Prisma schema with all v1 entities
- [x] Seed data for Cooper Estate sample blocks
- [x] Authenticated app shell (sidebar + mobile bottom nav)
- [x] Dashboard with summary cards
- [x] Block list and block detail pages
- [x] Map placeholder page

### Sprint 2 — Tasks

- [x] Task list with status filters and timeline grouping
- [x] Task detail page with status workflow
- [x] Task creation form
- [x] Quick log from block detail (slide-up sheet)
- [x] Dashboard upcoming tasks section

### Sprint 3 — Equipment

- [x] Equipment directory with status filters
- [x] Equipment detail with maintenance history
- [x] Maintenance record logging and next-service updates
- [x] Equipment picker on task create and quick-log
- [x] Dashboard service-due alerts
- [x] Seed data for 6 vineyard assets

### Sprint 4 — Irrigation

- [x] Irrigation schedules per block with frequency and method
- [x] Irrigation records with volume, duration, and status
- [x] Irrigation hub with schedules, records, and alerts views
- [x] Overdue alert logic based on schedule frequency
- [x] Quick log irrigation from block detail
- [x] Dashboard irrigation alerts section

### Sprint 5 — 2D map

- [x] Mapbox GL JS integration
- [x] Block polygon rendering
- [x] Tap → drawer with quick actions
- [x] Status overlays

### Sprint 6 — Mobile polish

- [x] Touch targets (`touch` button size, 48px+ field controls)
- [x] Outdoor readability utilities (`field-readable`, safe-area padding)
- [x] Field log hub (`/field`) — one-tap task and irrigation logging
- [x] Reduced quick-log form depth (type chips, collapsible details)
- [x] One-handed bottom nav (Map · Field · Tasks · Blocks · More)

### Sprint 7 — Real data import

- [x] Extract GPS polygons from Cooper Estate KML → `prisma/data/geometry.json`
- [x] Fix estate centroid to audited GIS value (46.26513, -119.45518)
- [x] Schema extensions: BlockType, terrain/elevation, GrowthStage, IrrigationPump
- [x] Load 35 vineyard blocks + 12 infrastructure areas from `cooper-estate-blocks.v1.json`
- [x] Seed real MapFeature polygons (no fabricated rectangles)
- [x] Import 3 irrigation records (blocks 3, 31, 32 — 2026-04-14)
- [ ] Base44 full entity dump (optional if KML source is sufficient)
- [ ] Blake's House / Cowboy's Place polygons (missing from KML — 2/47)

### Sprint 8 — Intelligence

See [sprint-8-plan.md](./sprint-8-plan.md) for detailed implementation steps.

- [ ] 3D map toggle (Mapbox terrain + pitch)
- [ ] Weather provider abstraction + dashboard card
- [ ] Block terrain / viticulture metrics on detail pages
- [ ] Irrigation pump map pins + `/reports` CSV export

## Current focus

Sprint 8: 3D map prototype, sensor/API abstraction, and reporting.
