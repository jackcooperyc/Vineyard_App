import area from "@turf/area";
import buffer from "@turf/buffer";
import { feature, featureCollection } from "@turf/helpers";
import intersect from "@turf/intersect";
import simplify from "@turf/simplify";
import type { Feature, LineString, Polygon, MultiPolygon } from "geojson";

type BlockGeometry = Polygon | MultiPolygon;

function toPolygonFeature(
  geometry: unknown,
): Feature<Polygon | MultiPolygon> | null {
  if (!geometry || typeof geometry !== "object") return null;
  const g = geometry as { type?: string; coordinates?: unknown };
  if (g.type === "Polygon" || g.type === "MultiPolygon") {
    return feature(g as BlockGeometry);
  }
  return null;
}

export function computeCoveragePercent(
  points: { lat: number; lng: number }[],
  blockGeometry: unknown,
  swathWidthM: number,
): number | null {
  if (points.length < 2) return null;

  const blockFeature = toPolygonFeature(blockGeometry);
  if (!blockFeature) return null;

  const blockArea = area(blockFeature);
  if (blockArea <= 0) return null;

  const line: Feature<LineString> = feature({
    type: "LineString",
    coordinates: points.map((p) => [p.lng, p.lat]),
  });

  const simplified = simplify(line, { tolerance: 0.00001, highQuality: false });
  const swath = buffer(simplified, swathWidthM / 2, { units: "meters" });
  if (!swath) return null;

  const clipped = intersect(featureCollection([blockFeature, swath]));
  if (!clipped) return 0;

  const coveredArea = area(clipped);
  return Math.min(100, Math.round((coveredArea / blockArea) * 1000) / 10);
}
