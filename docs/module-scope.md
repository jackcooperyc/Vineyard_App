# Module Scope

## v1 modules (Sprint 0–5)

### Blocks and varietals — Sprint 1

- Vineyard and block directory
- Planting records (varietal, vine count, year planted, rootstock)
- Block detail page with notes
- Basic CRUD for block data

### Tasks — Sprint 2 ✓

- Configurable task types via `TaskTypeDefinition` (label, icon, color, quick-log defaults) — settings at `/tasks/settings`
- Bulk task editing on tasks hub (status, type, assignee, due date)
- Task types: pruning, spraying, harvesting, inspection, other (seed defaults; admin-configurable)
- Status workflow: pending → in progress → completed (cancel/reopen supported)
- Task list with filters and timeline grouping by due date
- Task detail page with status actions
- Full create form and quick log sheet from block detail
- Dashboard upcoming tasks section

### Equipment — Sprint 3 ✓

- Equipment directory with type and status filters (including needs service)
- Equipment detail with maintenance history and open tasks
- Maintenance record logging with next-service date updates
- Equipment assignment on task create and quick-log
- Dashboard service-due count and equipment alerts

### Irrigation — Sprint 4 ✓

- Irrigation schedules per block (daily, weekly, bi-weekly, monthly)
- Irrigation records (date, volume, duration, method, status)
- Alerts view for overdue irrigation based on schedule frequency
- Quick log from block detail
- Dashboard irrigation alerts

### Map — Sprint 5 ✓

- Mapbox GL JS 2D/3D view
- Block polygon overlays from `MapFeature`
- Tap block → slide-up drawer with quick actions
- Status overlays (tasks, irrigation)
- Irrigation pump markers with serviced-block highlighting (`?pump=id` deep links)
- Block drawer shows pumps servicing the selected block

### GPS task progress — post-Sprint 8 ✓

- `TaskGpsSession` / `TaskGpsPoint` models; `TaskTypeDefinition.tracksGpsProgress` + `defaultSwathWidthM`
- Field log GPS tab: start/pause/resume/end sessions; Turf.js block coverage %
- Row progress when `BlockRow` GIS data or planting spacing exists
- Coverage chips on task list cards; GPS sessions on task detail
- Dashboard active sessions widget; reports GPS coverage table
- Offline queue stub (`src/lib/gps-offline-queue.ts`) — full IndexedDB sync deferred v2

## v2 modules (Sprint 6–8)

### Mobile polish — Sprint 6 ✓

- Touch-optimized controls and field-readable mobile typography
- `/field` hub for one-tap task and irrigation logging
- One-handed bottom navigation (Map · Field · Tasks · Blocks)
- Collapsible quick-log details on block pages

### Data import — Sprint 7

- CSV import templates
- Validation and admin review flow
- Cooper Estate real block data load
- Geometry linkage

### Intelligence — Sprint 8

- 3D map toggle (Mapbox terrain)
- Sensor/API integration abstraction
- Weather overlays
- Reporting and yield forecasting

## Shared cross-cutting concerns

- Auth (Auth.js + Neon)
- Mobile-responsive app shell
- Domain-driven folder structure under `src/domains/`
- Notes attachable to blocks (and later tasks)
- Task email notifications (opt-in per user at `/settings/notifications`; Resend + Vercel Cron for due/overdue reminders)
