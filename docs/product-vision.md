# Product Vision

## Mission

Cooper Estate Vineyard Management is the operational command center for Cooper Wine Company / Cooper Estate Vineyards on Red Mountain, Washington. It gives vineyard managers and field crews a single place to see block-level data, log work, track equipment and irrigation, and interact with the vineyard through an interactive map.

## Core idea

**Blocks are the source of truth.** Every record — varietal plantings, tasks, equipment usage, irrigation events, notes, and map features — resolves back to a vineyard block. This keeps field workflows grounded in real vineyard geography rather than abstract spreadsheets.

## Who it serves

- **Owners and managers** — overview of vineyard status, planning, and reporting
- **Field workers** — fast mobile logging from the vineyard
- **Consultants** (future) — read-only or scoped access to specific blocks

## What makes it different from a generic farm dashboard

1. **Block-centered data model** — not crop-generic; built for vineyard blocks, varietals, and plantings
2. **Map-first field UX** — tap a block on the map, get a drawer with quick actions
3. **Phased intelligence** — 2D operations first; 3D, sensors, and forecasting layered in later
4. **Real Cooper Estate data** — designed to ingest actual block records, not demo-only data

## v1 success criteria

- Authenticated team can browse all blocks with varietal and planting details
- Block list and detail pages work on mobile in the field
- Schema supports tasks, equipment, and irrigation (UI in later sprints)
- Architecture docs and domain model are stable enough for sprint-by-sprint delivery
- Deployed to Vercel with Neon Postgres

## Out of scope for v1

- 3D terrain visualization
- Live sensor feeds
- Yield forecasting
- Full offline/PWA sync
- Public or multi-tenant access

See [roadmap.md](./roadmap.md) for phased delivery.
