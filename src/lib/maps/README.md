# Mapbox integration

1. Set `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env` (and Vercel project env for production).
2. Block polygons load from `MapFeature.geometry` via `getMapBlocks()` in `src/domains/map/queries.ts`.
3. `VineyardMap` renders GeoJSON with Mapbox GL JS (`satellite-streets-v12` style).
4. Tap a block polygon → `BlockMapDrawer` slide-up sheet with quick log actions.
5. Fill color reflects status: green (normal), amber (open tasks), blue (irrigation overdue).
6. Optional per-block `colorHex` overrides status colors when set on `Block`.
7. **3D mode** (`/map?view=3d`): Mapbox terrain DEM, pitched camera, vineyard block extrusion by `elevMed`.

## Layer helpers

Paint expressions and layer IDs live in `src/lib/maps/layers.ts`.

## 3D requirements

- Same `NEXT_PUBLIC_MAPBOX_TOKEN` (terrain DEM included with Mapbox token).
- Vineyard blocks extrude relative to `ELEVATION_BASE_M` (198.66 m); infrastructure stays flat.
- Toggle via the 2D/3D pill on the map or `?view=3d` query param.
