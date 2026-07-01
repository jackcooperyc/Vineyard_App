# Oversight log — Cooper Estate Vineyard Management

Activity log for data import, deployment, and security items requiring human review.

## 2026-07-01 — Production seed (Neon, manual sync)

### Completed

- Ran `./scripts/sync-production-db.sh` against Neon production (`cev-app-db` / Vercel marketplace) with dashboard-supplied `DATABASE_URL` and `DIRECT_URL` (not committed; `.env.production.local` unchanged).
- Schema already in sync with Prisma; seed completed idempotently.
- Approximate counts verified: **35 blocks**, **18 tasks**, **10 irrigation schedules**, **12 irrigation records** (9 demo + 3 imported), **13 varieties**, **6 equipment**, admin user `admin@cooperestate.com`.
- Two blocks still without map geometry: Blake's House, Cowboy's Place (unchanged from Sprint 7).

### Notes

- Vercel `AUTH_URL` remains **https://cev.cupr.app** (custom domain); user also referenced `https://cev-app-puce.vercel.app` for smoke tests — no env change required for seed.

---


## 2026-07-01 — Production DB migration to Neon

### Completed

- Provisioned Neon database **`cev-app-db`** via Vercel marketplace integration (`falling-art-30934602`, region `pdx1` / US West)
- Updated Vercel env vars (`DATABASE_URL`, `DIRECT_URL`) on production, preview, and development with `sslmode=verify-full`
- Ran `./scripts/sync-production-db.sh` — schema push + Sprint 7 seed (35 blocks, 12 infrastructure, admin user)
- Production redeployed to https://cev-app-puce.vercel.app
- Login smoke test passed: `admin@cooperestate.com` → dashboard HTTP 200

## 2026-07-01 — Custom domain + Op-1–4 production deploy

### Completed

- Custom domain **https://cev.cupr.app** added on Vercel (aliases `cev-app-puce.vercel.app`)
- `AUTH_URL` updated to `https://cev.cupr.app` on Vercel production and preview
- Production redeployed at commit `373e3cb` (Op-1 through Op-4 operational UI track)
- Login page smoke test passed on both `cev.cupr.app` and `cev-app-puce.vercel.app`

### Manual follow-up

- **Production seed:** **Done** (2026-07-01) — see "Production seed (Neon, manual sync)" above

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

## 2026-07-01 — Op-1 + quick wins (operational UI polish)

### Completed

- **Tasks:** `updateTask` action + `/tasks/[id]/edit` page; `?blockId=` and type filter chips on `/tasks`; block detail "View all" links to block-scoped task list.
- **Irrigation:** `toggleScheduleActive` wired on schedule list cards; block irrigation record rows link to `/irrigation/records/[id]`.
- **Dashboard:** Irrigation, equipment, and tasks sections always visible with empty-state CTAs; Equipment + Irrigation added to quick links.
- **Mobile nav:** Alert count badge on More button when irrigation alerts or equipment service due.
- **Seed:** Expanded to 12 demo tasks (blocks 1, 3, 5, 7, 9, 13, 15, 18, 20, 22, 25, 40) and 6 schedules (blocks 1, 3, 5, 7, 9, 13).

### Follow-up (Op-2)

- Irrigation schedule detail page and edit form
- Per-block filter on irrigation hub
- Schedule update/delete actions

## 2026-07-01 — Op-2 (irrigation schedule admin)

### Completed

- **Schedule detail:** `/irrigation/schedules/[id]` with metadata, block link, active toggle, recent block records.
- **Edit schedule:** `/irrigation/schedules/[id]/edit` + `updateSchedule` action; `ScheduleForm` supports create and edit.
- **Hub filter:** `?blockId=` on `/irrigation` with block chip (schedules, records, alerts views); block detail "View all" and schedule rows deep-link correctly.
- **List cards:** Schedule cards link to schedule detail; alert cards include View schedule action.
- **Lifecycle:** Deactivate via existing `toggleScheduleActive` (no hard delete — schedules are soft-retired only).

### Follow-up (Op-3)

- Equipment `updateEquipment` action + edit form
- Dashboard empty states for equipment module

## 2026-07-01 — Op-3 (equipment polish)

### Completed

- **Edit equipment:** `updateEquipment` action + `/equipment/[id]/edit` page; `EquipmentForm` supports create and edit (name, type, status, serial, service dates, notes).
- **Detail page:** Edit button on equipment detail (matches task/schedule patterns).
- **Dashboard:** Equipment empty state CTAs — "Log service" and "Add equipment"; "Log service" added to quick links.

### Follow-up (Op-4)

- Expand seed script density across ~10 blocks
- Mobile More menu badges refinement
- Dashboard empty-state polish for all modules

## 2026-07-01 — Op-4 (density & discoverability)

### Completed

- **Seed density:** 18 demo tasks (blocks 1–15, 18–22, 25, 28, 40); 10 active schedules (blocks 1, 3, 5, 7, 9, 13, 15, 20, 27, 31); 9 additional demo irrigation records + 3 imported (blocks 3, 31, 32) — 12 blocks with irrigation history. Idempotent re-seed via unique notes.
- **Dashboard:** Consistent empty-state CTAs across irrigation (create schedule + log irrigation), equipment (log service + add equipment), and tasks (create task + field log). Quick-link "Log service" routes to `?status=NEEDS_SERVICE`.
- **Mobile nav:** Aggregate alert badge on More (ring for contrast); per-item badges on Equipment and Irrigation in the More dropdown; active-state highlight when on a More-route page.

### Next

- Sprint 8 Phase 2 — dashboard weather card, map weather chip, environmental thresholds

## 2026-07-01 — Sprint 8 Phase 2 #2 (weather provider abstraction)

### Completed

- Added `src/domains/weather/` domain module: `WeatherProvider` interface, `getCurrentWeather()` / `getWeatherForecast()` server queries.
- Open-Meteo adapter (keyless) for estate centroid `46.26513, -119.45518`; WMO `weather_code` → condition label + icon name.
- 15-minute `unstable_cache` scoped to provider + estate coordinates; `WEATHER_PROVIDER=open-meteo` (default) in `.env.example`.
- No UI in this ticket — queries ready for dashboard/map cards.

### Validation

- `npx prisma validate` — pass
- `npm run build` — pass (no `NEXT_PUBLIC_` weather leakage)
- `npm run lint` — pass

### Follow-up (Phase 2 UI)

- Dashboard weather card, map corner chip, `EnvironmentalThreshold` model + frost hint
