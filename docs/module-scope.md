# Module Scope

## v1 modules (Sprint 0–5)

### Blocks and varietals — Sprint 1

- Vineyard and block directory
- Planting records (varietal, vine count, year planted, rootstock)
- Block detail page with notes
- Basic CRUD for block data

### Tasks — Sprint 2

- Task types: pruning, spraying, harvesting, inspection, other
- Status workflow: pending → in progress → completed
- Assignment to user and optional equipment
- Quick log from block detail page

### Equipment — Sprint 3

- Equipment directory with type and status
- Maintenance records and service schedule
- Link equipment to tasks

### Irrigation — Sprint 4

- Irrigation schedules per block
- Irrigation records (date, volume, duration, method)
- Overdue/missed event alerts

### Map — Sprint 5

- Mapbox GL JS 2D view
- Block polygon overlays from `MapFeature`
- Tap block → slide-up drawer with quick actions
- Status overlays (tasks, irrigation)

## v2 modules (Sprint 6–8)

### Mobile polish — Sprint 6

- Touch-optimized forms
- One-handed navigation patterns
- Offline-tolerant UX planning

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
