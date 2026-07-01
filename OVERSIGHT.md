# Oversight log — Cooper Estate Vineyard Management

Activity log for data import, deployment, and security items requiring human review.

## 2026-07-01 — Production DB migration to Neon

### Completed

- Provisioned Neon database **`cev-app-db`** via Vercel marketplace integration (`falling-art-30934602`, region `pdx1` / US West)
- Updated Vercel env vars (`DATABASE_URL`, `DIRECT_URL`) on production, preview, and development with `sslmode=verify-full`
- Ran `./scripts/sync-production-db.sh` — schema push + Sprint 7 seed (35 blocks, 12 infrastructure, admin user)
- Production redeployed to https://cev-app-puce.vercel.app
- Login smoke test passed: `admin@cooperestate.com` → dashboard HTTP 200

### Decommission

- **Temporary Prisma Postgres** (`db.prisma.io`, expires ~2026-07-02) can be deleted — production now uses Neon
- Prior production DB password was exposed in chat; migration to Neon rotates those credentials

### Open items

| Item | Status |
|------|--------|
| Blake's House polygon | Missing from KML — block imported without `MapFeature` |
| Cowboy's Place polygon | Missing from KML — block imported without `MapFeature` |
| KML "Untitled polygon" | Unmapped — may be Blake's House or Cowboy's Place; needs field verification |

## 2026-07-01 — Sprint 7 real data import

### Completed

- Extracted **46/47** GPS polygons from `COOPER VINEYARD (3).kml` (Google Earth export; same geometry source as Base44 prototype KML import).
- Committed source files: `prisma/data/cooper-estate-blocks.v1.json`, `prisma/data/geometry.json`.
- Updated estate centroid to audited GIS value: `{ lat: 46.26513, lng: -119.45518 }`.
- Additive Prisma migration: `BlockType`, `infrastructureType`, terrain/elevation fields, `GrowthStage`, `colorHex`, `IrrigationPump`; `Planting.vineCount` / `yearPlanted` now optional.
- Replaced placeholder CEV-01..08 seed blocks with **35 vineyard blocks + 12 infrastructure areas**.
- Seeded **3 irrigation records** (blocks 3, 31, 32; applied 2026-04-14).
- Did **not** fabricate vine counts, year planted, or rootstock (left null per spec).

### Open items

| Item | Status |
|------|--------|
| Blake's House polygon | Missing from KML — block imported without `MapFeature` |
| Cowboy's Place polygon | Missing from KML — block imported without `MapFeature` |
| KML "Untitled polygon" | Unmapped — may be Blake's House or Cowboy's Place; needs field verification |
| Production DB password | **Resolved** — migrated to Neon (2026-07-01) |
| Temporary Prisma Postgres | **Decommission** — delete in Prisma dashboard |

### Validation

- Run before merge: `npx prisma validate`, `npx prisma db push`, `npm run build`, `npm run db:seed`

## 2026-07-01 — Sprint 6 mobile polish

### Completed

- `/field` page for one-handed task and irrigation logging
- Bottom nav reordered for thumb reach (Map, Field, Tasks, Blocks, More)
- Task type chips replace dropdowns in quick-log flows
- Irrigation quick-log defaults to “applied today” with optional details
- Block list filters (vineyard / infrastructure / all) with numeric sort
- Touch-sized controls and safe-area padding for mobile field use

## 2026-07-01 — Sprint 8 Phase 1 (3D map)

### Completed

- 2D / 3D toggle on `/map` with shareable `?view=3d` URL
- Mapbox terrain DEM + pitched camera (60° pitch, -20° bearing)
- Vineyard block extrusion from `elevMed`; infrastructure polygons stay flat
- Elevation min–max + median in block map drawer
- `colorHex` per-block map color override support in paint expressions

### Data quality flags preserved

- Block 6 (`6-CF6`): code implies Cab Franc; source varietal is Cab Sauv — note on block.
- Block 17 (`17-SG17`): no elevation in export.
- `Vineard RV Park`: typo preserved from source.
- Block numbering gap 35–39 preserved.

## 2026-07-01 — Next development plan (operational UI audit)

### Completed

- Audited tasks, equipment, and irrigation modules (app routes, domains, components, dashboard/block/field/map integration).
- Wrote `docs/next-development-plan.md`: current-state gap analysis, why UI feels empty, Op-1–4 operational track vs Sprint 8 Phase 2+, quick wins, and sequencing.
- Finding: Sprints 2–4 v1 CRUD is shipped; gaps are edit flows, block-scoped navigation, schedule admin UI, thin seed data, and mobile nav burying Equipment/Irrigation.
