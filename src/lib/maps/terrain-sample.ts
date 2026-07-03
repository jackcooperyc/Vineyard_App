import type mapboxgl from "mapbox-gl";
import type { MapBlockFeatureCollection } from "@/domains/map/types";

/** Average lng/lat of the outer ring (excludes duplicate closing vertex). */
export function blockCentroid(coordinates: number[][][]): [number, number] {
  const ring = coordinates[0];
  if (ring.length === 0) return [0, 0];

  const closes =
    ring.length > 1 &&
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1];
  const count = closes ? ring.length - 1 : ring.length;

  let sumLng = 0;
  let sumLat = 0;
  for (let i = 0; i < count; i++) {
    sumLng += ring[i][0];
    sumLat += ring[i][1];
  }

  return [sumLng / count, sumLat / count];
}

/**
 * Sample Mapbox terrain elevation at each block centroid and inject `terrainBaseM`
 * into feature properties. Falls back to `elevMed` when sampling returns null.
 */
export function injectTerrainElevations(
  map: mapboxgl.Map,
  geoJson: MapBlockFeatureCollection,
): MapBlockFeatureCollection {
  return {
    type: "FeatureCollection",
    features: geoJson.features.map((feature) => {
      const [lng, lat] = blockCentroid(feature.geometry.coordinates);
      const sampled = map.queryTerrainElevation([lng, lat]);
      const fallback = feature.properties.elevMed ?? 205;
      const terrainBaseM = sampled ?? fallback;

      return {
        ...feature,
        properties: {
          ...feature.properties,
          terrainBaseM,
        },
      };
    }),
  };
}
