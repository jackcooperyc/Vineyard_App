# Sprint 8 — Intelligence layer (plan)

**Status:** Next up  
**Prerequisite sprints:** 0–7 complete (Sprint 7 real data import shipped 2026-07-01; Sprint 6 mobile polish shipped after)

> **Sprint numbering note:** Sprint 7 was *real Cooper Estate data import* (35 blocks, KML polygons, schema extensions). That is done. Sprint 6 (*mobile polish*) was delivered out of order after Sprint 7. The next major build slice is **Sprint 8** below.

---

## Goal

Add a thin intelligence layer on top of the operational foundation: 3D vineyard visualization, external data hooks (weather first), and basic estate reporting — without blocking field workflows.

## Guiding constraints

- Reuse existing `MapFeature` GeoJSON (no new geometry fabrication).
- Schema-ready fields from the prototype (`ViticultureMetrics`, `EnvironmentalThresholds`, `IrrigationPump`) should be additive only.
- Ship vertical slices; defer ML/forecasting and satellite pipelines to a later sprint.
- Field UX from Sprint 6 (`/field`, quick logs) must not regress.

---

## Carryover from Sprint 7 (optional pre-work)

These are **not** Sprint 8 blockers but close open Sprint 7 items if time allows:

| Item | Action |
|------|--------|
| Blake's House polygon | Identify in KML / field survey; add to `geometry.json` + re-seed |
| Cowboy's Place polygon | Same |
| KML "Untitled polygon" | Field-verify mapping to missing infrastructure |
| Production DB | Migrate Prisma Postgres → Neon; rotate credentials |
| `vineCount` / `yearPlanted` | Leave null until sourced; do not fabricate |

---

## Phase 1 — 3D map prototype (priority)

**Outcome:** Toggle on `/map` between 2D satellite and pitched 3D terrain view using the same block polygons.

### Steps

1. **Map mode state** — `VineyardMap` client flag: `2d` \| `3d`; persist in URL query `?view=3d` for shareable links.
2. **Mapbox terrain** — Enable `mapbox-dem` raster-dem source + `setTerrain()` on 3D mode; remove on 2D.
3. **Camera** — On 3D enter: `pitch: 60`, `bearing: -20`, `fitBounds` unchanged; on exit: `pitch: 0`.
4. **Extrusion (optional v1)** — If performance allows, extrude vineyard blocks by `elevMed` or fixed height for visual depth; infrastructure stays flat.
5. **UI** — Floating toggle pill on map (mobile-safe, 48px); legend unchanged.
6. **Block drawer** — Show `elevMin` / `elevMed` / `elevMax` on block summary when present.
7. **Docs** — Update `src/lib/maps/README.md` with 3D requirements.

### Acceptance

- [x] 47 blocks render in both modes at correct Red Mountain location
- [x] Toggle works on mobile without breaking tap-to-drawer
- [x] No new env vars beyond existing `NEXT_PUBLIC_MAPBOX_TOKEN`

---

## Phase 2 — Weather & API abstraction

**Outcome:** Estate-level weather on dashboard + map; pluggable provider interface for future sensors.

### Steps

1. **Domain module** — `src/domains/weather/` with `WeatherProvider` interface (`getCurrent`, `getForecast`).
2. **Open-Meteo or OpenWeather adapter** — Server-side fetch using estate centroid (`46.26513, -119.45518`); cache 15 min (Next.js `unstable_cache` or simple TTL).
3. **Env** — `OPENWEATHER_API_KEY` or use keyless Open-Meteo for v1.
4. **Dashboard card** — Temp, wind, conditions, frost-risk hint if below configurable threshold.
5. **Map overlay (light)** — Small weather chip on map corner; full overlay deferred.
6. **Environmental thresholds** — Prisma model `EnvironmentalThreshold` (vineyard-level): `frostWarningTempF`, `heatStressTempF`; seed defaults; admin edit later.

### Acceptance

- [ ] Dashboard shows live weather for estate center
- [ ] Provider swappable without UI changes
- [ ] API keys server-only (never `NEXT_PUBLIC_`)

---

## Phase 3 — Block intelligence on detail pages

**Outcome:** Surface terrain and viticulture-ready fields already in schema / prototype spec.

### Steps

1. **Block detail** — Terrain section: acreage, `areaSqm`, `perimeterM`, elevation trio, `growthStage`.
2. **`colorHex`** — Honor per-block map fill override when set (fallback to status overlay colors).
3. **ViticultureMetrics model** — Additive Prisma: `blockId`, `currentNdviScore`, `cumulativeGdd`, `lastSatellitePass` (all optional).
4. **UI placeholder** — “Satellite metrics not connected” empty state on block detail (Sprint 8b hook for Earth Engine).
5. **Infrastructure blocks** — Show `infrastructureType` prominently; hide planting section.

### Acceptance

- [ ] Block 40-CM40 shows elevation + acreage from imported data
- [ ] Map respects `colorHex` when populated

---

## Phase 4 — Irrigation pumps & reporting

**Outcome:** Operational reporting for irrigation and tasks; pump entity ready for map pins.

### Steps

1. **IrrigationPump CRUD** — Admin list + create form: name, `gpsPoint` (GeoJSON Point), `flowCapacity`, `servicedBlockIds[]`.
2. **Map pins** — Render pumps as point layer in 2D/3D (distinct icon).
3. **Reports page** — `/reports` with:
   - Tasks completed by block (last 30 days)
   - Irrigation records by block (volume totals)
   - Export CSV (client-side download)
4. **Dashboard link** — “Reports” in More menu / sidebar.

### Acceptance

- [ ] At least one pump can be created and appears on map
- [ ] CSV export of irrigation records works

---

## Suggested implementation order (for Cursor)

```
Week 1: Phase 1 (3D map toggle + elevation in drawer)
Week 2: Phase 2 (weather provider + dashboard card)
Week 3: Phase 3 (block detail terrain + ViticultureMetrics schema)
Week 4: Phase 4 (reports + irrigation pumps)
```

---

## Out of scope (Sprint 9+)

- Google Earth Engine / NDVI automation
- Yield forecasting models
- Full offline PWA
- RBAC enforcement in UI
- Block CRUD admin
- Labor hours YTD
- AQI / solar insolation integrations

---

## Validation checklist (before merge)

```bash
npx prisma validate
npx prisma db push
npm run build
npm run db:seed
```

Append results to `OVERSIGHT.md`.

## Env vars (anticipated)

| Variable | Phase | Notes |
|----------|-------|-------|
| `NEXT_PUBLIC_MAPBOX_TOKEN` | 1 | Existing |
| `OPENWEATHER_API_KEY` | 2 | Optional if using Open-Meteo |
| `WEATHER_PROVIDER` | 2 | `open-meteo` \| `openweather` |

---

## Reference

- Prototype patterns: `vin-ops-pro` EstateMap (weather), AdminBlocks (terrain/NDVI columns)
- Source spec: `prisma/data/cooper-estate-blocks.v1.json` → `gis_schema_from_prototype`
- Map notes: `src/lib/maps/README.md`
