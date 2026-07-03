# Oversight log — Cooper Estate Vineyard Management

Activity log for data import, deployment, and security items requiring human review.

## 2026-07-03 — Soft delete with 48-hour recovery

### Completed

- **Schema:** `deletedAt` on `Task`, `IrrigationRecord`, `IrrigationSchedule`, `MaintenanceRecord`.
- **Domain:** `src/lib/soft-delete.ts` + `soft-delete-purge.ts` (purge on delete/restore/trash list access); restore actions per entity; all list/detail queries filter `deletedAt: null`.
- **UI:** Tasks hub `?trash=1`; irrigation hub `?view=deleted`; equipment detail recently-deleted maintenance panel; shared `SoftDeleteSheet` + `RecentlyDeletedPanel`; delete on irrigation record/schedule detail and maintenance history.
- **Deferred:** `Equipment` retire remains status-based (lifecycle, not deletion); `Note`, `TaskTypeDefinition`, blocks/vineyards have no delete UX.

### Verification

- `npx prisma validate` — pass
- `npx prisma generate` — pass
- `npx tsc --noEmit` — pass
- `npm run lint` — pass
- `npm run build` — compile + TS pass; page data collection blocked locally (`DATABASE_URL` not set in build shell)
- `prisma db push` — not run (local DB unreachable)

---

---

## 2026-07-03 — Task notification system

### Completed

- **Schema:** `UserNotificationPreference`, `NotificationDelivery`, `Task.createdById`; enums for event type, channel, delivery status.
- **Domain:** `src/domains/notifications/` — preferences, outbox delivery, email templates (Resend), quiet hours, due-soon/overdue cron logic with overdue throttle (1/day/task/user).
- **Hooks:** `createTask`, `quickLogTask`, `updateTask`, `updateTaskStatus`, `bulkUpdateTasks` emit events respecting prefs and soft-delete filters.
- **UI:** `/settings/notifications` toggle matrix; link in app More nav.
- **Cron:** `GET /api/cron/task-reminders` + `vercel.json` hourly schedule (`CRON_SECRET`).

### Verification

- `npx prisma validate` — pass
- `npx tsc --noEmit` — pass
- `npm run lint` — pass
- `npm run build` — pass

### Production env

- `RESEND_API_KEY`, `EMAIL_FROM` — email delivery (optional; outbox stays pending)
- `CRON_SECRET` — authorize Vercel Cron requests

---

## 2026-07-03 — Configurable task types + bulk task editing

### Completed

- **Schema:** `TaskTypeDefinition` model; `Task.taskTypeId` FK replaces `TaskType` enum; `scripts/migrate-task-types.ts` backfills legacy DBs before `db push`.
- **Domain:** `type-queries`, `type-actions`, `type-validators`, `type-icons`; task actions use DB defaults for quick-log title/due date; `bulkUpdateTasks` for status, type, assignee, due date.
- **UI:** All task surfaces read types from DB; `/tasks/settings` CRUD for task types; tasks hub bulk selection bar; gear link from tasks hub.
- **Seed:** `seed-task-types.ts` with five legacy types; `seed.ts` resolves `taskTypeId` via slug.

### Verification

- `npx tsc --noEmit` — pass
- `npm run lint` — pass
- `npm run build` — pass

---

## 2026-07-03 — Operational modules Op-5 through Op-9

### Completed

- **Op-5 Detail & navigation:** `hub-back-href.ts` back-param encoding on hub list cards and detail/edit pages; `updateIrrigationRecord` + record edit route; schedule due hints; task `updatedAt`; block equipment section from open tasks.
- **Op-6 Field & map:** Field log maintenance mode with equipment picker; `equipment-hub-quick-log-sheet`; map drawer equipment from open tasks; irrigation hub pumps link; schedule detail pump note.
- **Op-7 Hub depth:** Tasks assignee/equipment filters and pagination (`TASKS_PAGE_SIZE=50`); irrigation record status + schedule search; equipment service-due filter and calendar view.
- **Op-8 Lifecycle:** `deleteTask`, `retireEquipment`, `updateMaintenanceRecord` with confirm/edit UI.
- **Op-9 Reports:** `getEquipmentMaintenanceReport`, `getOverdueIrrigationReport`, `getOpenTasksByTypeReport`; extended `/reports` page and CSV exports; dashboard filtered hub quick links; additional seed maintenance records.

### Verification

- `npx tsc --noEmit` — pass
- `npm run lint` — pass

---

## 2026-07-02 — Vercel Git repository link (cev-app)

### Completed

- Verified Vercel project **cev-app** (`prj_MoFPQPGUm9WkaYeKnjCMWE6bSqyg`) is connected to **jackcooperyc/Vineyard_App** (GitHub, production branch `main`), not **jackcooperyc/CEV_App**.
- Non-interactive check: `npx vercel git connect https://github.com/jackcooperyc/Vineyard_App.git --non-interactive` reports the repo is already connected (no replace prompt needed).
- Local `origin` remote matches: `https://github.com/jackcooperyc/Vineyard_App.git`.

---

## 2026-07-01 — Production deploy (tasks / irrigation / equipment hubs)

### Completed

- `main` @ `4ed2369` (OVERSIGHT log for PR #13 / PR #14 merges) deployed to Vercel production via `npx vercel deploy --prod --yes`.
- Deployment: https://cev-e3ilj8n42-jackcooperyc-6691s-projects.vercel.app (`dpl_J11BoTEyd45bumJ7UfqL3Bikd9GF`).
- Production aliases confirmed: **https://cev.cupr.app**, **https://cev-app-puce.vercel.app** (plus team default URLs).
- Login smoke test: **https://cev.cupr.app/login** → HTTP 200; **https://cev-app-puce.vercel.app/login** → HTTP 200.

---

## 2026-07-01 — Tasks hub comprehensive rebuild

**Merged:** [PR #13](https://github.com/jackcooperyc/Vineyard_App/pull/13) → `main` @ `09367b8`

### Completed

- Rebuilt `/tasks` as a production-quality hub aligned with irrigation hub patterns (Op-2).
- **Header:** summary stat chips (open, overdue, due this week, completed in last 7 days) with deep-link filters.
- **Filters:** status, block picker, task type chips, debounced title search, sort (due date / recently added / title / status), clear-all.
- **Views:** timeline (grouped by due urgency) and flat list toggle via `?view=`.
- **Cards:** type icons, overdue/today urgency styling, assignee and due date on cards.
- **Empty states:** contextual CTAs (new task, field log, clear filters) per active filter set.
- **Quick actions:** desktop Quick log sheet + New task; mobile Add dropdown + floating quick-log FAB.
- **Domain:** extended `getTasks` (search, sort, due-range) and added `getTaskHubStats`.
- **Detail polish:** task detail page shows type icon, urgency badge, created date.
- Preserved existing create, edit, and status workflow routes.

### Verification

- `npx tsc --noEmit` — pass
- `npm run lint` — pass
- `npm run build` — compile + TypeScript pass; page data collection requires `DATABASE_URL` in local env (pre-existing)

---

## 2026-07-01 — Production DB sync (Sprint 8 schema)

### Completed

- Ran `./scripts/sync-production-db.sh` against Neon production after Sprint 8 schema changes (weather thresholds, irrigation pumps, viticulture metrics, etc.).
- Prisma schema pushed; seed completed idempotently (35 blocks, 12 infrastructure, environmental thresholds, demo pump, admin user).
- Login smoke test: **https://cev.cupr.app/login** → HTTP 200.

---

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

- ~~Dashboard weather card, map corner chip, `EnvironmentalThreshold` model + frost hint~~ **Done** (2026-07-01)
- Block detail terrain section, ViticultureMetrics schema — **Done** (2026-07-01)
- IrrigationPump CRUD, `/reports` CSV export, map pump pins — **Done** (2026-07-01)
- `middleware.ts` → `proxy.ts` migration — **Done** (2026-07-01)

## 2026-07-01 — Sprint 8 Phase 2–4 (weather UI, terrain, pumps, reports)

### Completed

- **PR #6 merged:** Weather provider abstraction (`src/domains/weather/`, Open-Meteo, 15-min cache).
- **Dashboard weather card:** Temp, wind, humidity, 5-day forecast, frost/heat hints from `EnvironmentalThreshold`.
- **Map weather chip:** Estate conditions overlay (top-right); 2D/3D toggle shifted down to avoid overlap.
- **`EnvironmentalThreshold` model:** Vineyard-level `frostWarningTempF` (32°F) and `heatStressTempF` (95°F); seeded defaults.
- **Block detail terrain:** Acreage, area, perimeter, elevation trio, growth stage, `colorHex`; infrastructure type for non-vineyard blocks; plantings hidden for infrastructure.
- **`ViticultureMetrics` model:** Schema + “Satellite metrics not connected” placeholder on block detail.
- **IrrigationPump CRUD:** `/pumps` list, `/pumps/new`, `/pumps/[id]`; demo pump at estate centroid in seed.
- **Map pump pins:** Blue circle layer for registered pumps (2D/3D).
- **`/reports`:** Tasks completed + irrigation volume by block (last 30 days); client-side CSV export; nav in sidebar + More menu.
- **Technical debt:** `equipment-select-field.tsx` lint fix (`<Link>`); `middleware.ts` → `proxy.ts` (Next.js 16).

### Validation

- `npx prisma validate` — pass
- `npx tsc --noEmit` — pass
- `npm run build` — pass (with `DATABASE_URL` from `.env`; `.env.production.local` empty locally)
- `npm run lint` — pass
- `npm run db:seed` — pass (environmental thresholds + demo pump idempotent)

### Open items (human review)

| Item | Status |
|------|--------|
| Blake's House polygon | Missing from KML — field verification needed |
| Cowboy's Place polygon | Missing from KML — field verification needed |
| KML "Untitled polygon" | Unmapped — field verification needed |
| Mapbox token URL restrictions | Mapbox dashboard — restrict to `cev.cupr.app` |
| GitHub branch protection / CI gates | GitHub admin |
| Production seed on Neon | **Done** (2026-07-01) — Sprint 8 schema sync; see entry above |
| Seed password rotation | Defer — documented in seed output |

---

## 2026-07-01 — Irrigation & equipment hub rebuild

**Merged:** [PR #14](https://github.com/jackcooperyc/Vineyard_App/pull/14) → `main` @ `48d306a`

### Completed

- **Irrigation hub (`/irrigation`):** Stat chips (active schedules, overdue alerts, records/volume this week), enhanced filter bar (block select, active/inactive schedules, record date range), polished view bar with icons, schedule due hints, richer record/alert cards, contextual empty states, hub quick actions (new schedule, log irrigation sheet, field log link).
- **Equipment hub (`/equipment`):** Stat chips (operational, needs service, in maintenance, retired), search + type filter, richer list cards with type icons and open task counts, contextual empty states, hub actions (add equipment, log maintenance shortcut).
- **Equipment detail:** Type icon, maintenance history cards, `#maintenance` anchor for service logging.
- **Queries:** `getIrrigationHubStats`, `getSchedulesWithDueHints`, record range filters; `getEquipmentHubStats`, search/type filters, open-task counts on list items.

### Validation

- `npx tsc --noEmit` — pass
- `npm run lint` — pass
- `npm run build` — compiles; page-data step requires `DATABASE_URL` in env (same as prior sprints)
