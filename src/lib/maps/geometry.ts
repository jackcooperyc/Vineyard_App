import area from "@turf/area";
import length from "@turf/length";
import { polygon as turfPolygon } from "@turf/helpers";
import type { MapBlockGeometry } from "@/domains/map/types";

const SQFT_PER_ACRE = 43_560;
const SQM_PER_SQFT = 0.092903;

export function polygonCentroid(geometry: MapBlockGeometry): {
  lat: number;
  lng: number;
} {
  const ring = geometry.coordinates[0];
  let sumLat = 0;
  let sumLng = 0;
  const count = ring.length - 1;
  for (let i = 0; i < count; i++) {
    sumLng += ring[i][0];
    sumLat += ring[i][1];
  }
  return { lat: sumLat / count, lng: sumLng / count };
}

export function polygonMetrics(geometry: MapBlockGeometry): {
  areaSqm: number;
  acreage: number;
  perimeterM: number;
} {
  const feature = turfPolygon(geometry.coordinates);
  const areaSqm = area(feature);
  const ring = geometry.coordinates[0];
  const closed =
    ring.length > 0 &&
    ring[0][0] === ring[ring.length - 1][0] &&
    ring[0][1] === ring[ring.length - 1][1]
      ? ring
      : [...ring, ring[0]];
  const perimeterM = length(
    {
      type: "Feature",
      properties: {},
      geometry: { type: "LineString", coordinates: closed },
    },
    { units: "meters" },
  );

  return {
    areaSqm,
    acreage: (areaSqm / SQM_PER_SQFT) / SQFT_PER_ACRE,
    perimeterM,
  };
}

export function slugifyMapSpaceCode(name: string): string {
  const slug = name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 24);
  return slug || "SPACE";
}
