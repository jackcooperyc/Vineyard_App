import distance from "@turf/distance";
import length from "@turf/length";
import nearestPointOnLine from "@turf/nearest-point-on-line";
import { lineString, point } from "@turf/helpers";
import type { Feature, LineString } from "geojson";
import { GPS_ROW_MATCH_THRESHOLD_M, GPS_ROW_VISIT_RATIO } from "@/domains/task-gps/constants";

export type BlockRowGeometry = {
  rowIndex: number;
  geometry: unknown;
  lengthM: number | null;
};

function parseLineString(geometry: unknown): Feature<LineString> | null {
  if (!geometry || typeof geometry !== "object") return null;
  const g = geometry as { type?: string; coordinates?: number[][] };
  if (g.type !== "LineString" || !Array.isArray(g.coordinates)) return null;
  return lineString(g.coordinates);
}

export function countVisitedRows(
  points: { lat: number; lng: number }[],
  rows: BlockRowGeometry[],
): { visited: number; total: number } {
  if (rows.length === 0 || points.length === 0) {
    return { visited: 0, total: rows.length };
  }

  const rowProgress = new Map<number, number>();

  for (const p of points) {
    const pt = point([p.lng, p.lat]);
    for (const row of rows) {
      const line = parseLineString(row.geometry);
      if (!line) continue;

      const nearest = nearestPointOnLine(line, pt, { units: "meters" });
      const distM = nearest.properties?.dist ?? distance(pt, nearest, { units: "meters" });
      if (distM > GPS_ROW_MATCH_THRESHOLD_M) continue;

      const rowLen = row.lengthM ?? length(line, { units: "meters" });
      if (rowLen <= 0) continue;

      const along = nearest.properties?.location ?? 0;
      const prev = rowProgress.get(row.rowIndex) ?? 0;
      rowProgress.set(row.rowIndex, Math.max(prev, along));
    }
  }

  let visited = 0;
  for (const row of rows) {
    const line = parseLineString(row.geometry);
    if (!line) continue;
    const rowLen = row.lengthM ?? length(line, { units: "meters" });
    const progress = rowProgress.get(row.rowIndex) ?? 0;
    if (rowLen > 0 && progress / rowLen >= GPS_ROW_VISIT_RATIO) {
      visited += 1;
    }
  }

  return { visited, total: rows.length };
}
