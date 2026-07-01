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

- Task list, detail, and creation flows
- Quick log from block detail
- Status workflow and filters

### Sprint 3 — Equipment

- Equipment directory and detail
- Maintenance records and reminders
- Task linkage

### Sprint 4 — Irrigation

- Schedule creation
- Irrigation history by block
- Overdue/missed alerts

### Sprint 5 — 2D map

- Mapbox GL JS integration
- Block polygon rendering
- Tap → drawer with quick actions
- Status overlays

### Sprint 6 — Mobile polish

- Touch targets and outdoor readability
- Reduced form depth for field logging
- One-handed navigation

### Sprint 7 — Real data import

- CSV templates and validation
- Cooper Estate block data load
- Geometry linkage

### Sprint 8 — Intelligence

- 3D map prototype
- Sensor/API abstraction
- Reporting and forecasting

## Current focus

Sprint 0 + Sprint 1: working skeleton with authenticated shell, seeded blocks, list/detail pages, and deployment-ready configuration.
