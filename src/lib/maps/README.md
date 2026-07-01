# Mapbox integration (Sprint 5)

1. Set `NEXT_PUBLIC_MAPBOX_TOKEN` in `.env` (and Vercel project env for production).
2. Block polygons load from `MapFeature.geometry` via `getMapBlocks()` in `src/domains/map/queries.ts`.
3. `VineyardMap` renders GeoJSON with Mapbox GL JS (`satellite-streets-v12` style).
4. Tap a block polygon → `BlockMapDrawer` slide-up sheet with quick log actions.
5. Fill color reflects status: green (normal), amber (open tasks), blue (irrigation overdue).
6. Future 3D: enable terrain + pitch on the same GeoJSON source.
