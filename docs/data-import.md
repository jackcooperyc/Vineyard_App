# Real data import (Sprint 7)

Companion spec and source files for Cooper Estate foundational data.

## Source files

| File | Purpose |
|------|---------|
| `prisma/data/cooper-estate-blocks.v1.json` | 35 vineyard blocks, 12 infrastructure areas, 13 varieties |
| `prisma/data/geometry.json` | GPS polygons extracted from Cooper Estate KML |
| `scripts/extract-kml-geometry.ts` | Re-extract geometry if KML is updated |

## Re-extract geometry

```bash
npm run db:extract-geometry
# or: npx tsx scripts/extract-kml-geometry.ts /path/to/COOPER\ VINEYARD.kml
```

Polygons are sourced from the Google Earth KML export (same geometry pipeline as the Base44 prototype `importKml` function). Do not fabricate coordinates.

## Seed

```bash
npx prisma db push   # or migrate deploy in production
npm run db:seed
```

The seed replaces all blocks for Cooper Estate Vineyards with real data. Demo equipment and sample tasks remain for development.

## Estate centroid

Audited GIS centroid: `{ lat: 46.26513, lng: -119.45518 }` — used in map defaults and documented in `src/domains/map/constants.ts`.

## Known gaps

See [OVERSIGHT.md](../OVERSIGHT.md) for missing polygons (Blake's House, Cowboy's Place), unmapped KML placemark, and fields intentionally left null (vine counts, year planted, rootstock).
