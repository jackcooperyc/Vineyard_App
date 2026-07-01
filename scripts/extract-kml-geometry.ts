/**
 * Extract GeoJSON polygons from Cooper Estate KML into geometry.json.
 * Source: COOPER VINEYARD KML (Google Earth export) — same polygons as Base44 prototype.
 *
 * Usage: npx tsx scripts/extract-kml-geometry.ts [path-to.kml]
 */

import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

type GeoJsonPolygon = {
  type: "Polygon";
  coordinates: number[][][];
};

type GeometryEntry = {
  kmlName: string;
  matchKey: string;
  geometry: GeoJsonPolygon;
  centerLat: number;
  centerLng: number;
  vertexCount: number;
};

function decodeHtmlEntities(value: string): string {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"');
}

function normalizeKmlName(name: string): string {
  const trimmed = decodeHtmlEntities(name.trim().replace(/\s+/g, " "));
  // "1- CS1" → "1-CS1", "10- CS10" → "10-CS10"
  const spaced = trimmed.replace(/^(\d+)\s*-\s*/, "$1-");
  // "18- 18ZN" → "18-ZN", "25- 25NB" → "25-NB"
  return spaced
    .replace(/^18-18ZN$/i, "18-ZN")
    .replace(/^18- 18ZN$/i, "18-ZN")
    .replace(/^25-25NB$/i, "25-NB")
    .replace(/^25- 25NB$/i, "25-NB");
}

function kmlCoordsToGeoJson(coordString: string): GeoJsonPolygon | null {
  const pairs = coordString
    .trim()
    .split(/\s+/)
    .map((c) => {
      const [lng, lat] = c.split(",").map(Number);
      return [lng, lat] as [number, number];
    })
    .filter(([lng, lat]) => !Number.isNaN(lng) && !Number.isNaN(lat));

  if (pairs.length < 3) return null;

  const first = pairs[0];
  const last = pairs[pairs.length - 1];
  if (first[0] !== last[0] || first[1] !== last[1]) {
    pairs.push([...first]);
  }

  return { type: "Polygon", coordinates: [pairs] };
}

function polygonCenter(geometry: GeoJsonPolygon): { lat: number; lng: number } {
  const ring = geometry.coordinates[0];
  let sumLat = 0;
  let sumLng = 0;
  const count = ring.length - 1; // exclude closing vertex
  for (let i = 0; i < count; i++) {
    sumLng += ring[i][0];
    sumLat += ring[i][1];
  }
  return { lat: sumLat / count, lng: sumLng / count };
}

function parseKml(xmlText: string): GeometryEntry[] {
  const results: GeometryEntry[] = [];
  const skipNames = new Set([
    "COOPER VINEYARD",
    "Cooper Wine Company",
    "Cooper Wine Co. - Map",
    "Untitled measurement",
  ]);

  const placemarkRegex = /<Placemark[\s\S]*?<\/Placemark>/gi;
  const placemarks = xmlText.match(placemarkRegex) ?? [];

  for (const pm of placemarks) {
    const nameMatch = pm.match(/<name>\s*([\s\S]*?)\s*<\/name>/i);
    const rawName = nameMatch ? nameMatch[1].trim() : "Unnamed";
    if (skipNames.has(rawName)) continue;

    const polygonMatch = pm.match(/<Polygon[\s\S]*?<\/Polygon>/i);
    if (!polygonMatch) continue;

    const coordsMatch = polygonMatch[0].match(
      /<coordinates>\s*([\s\S]*?)\s*<\/coordinates>/i,
    );
    if (!coordsMatch) continue;

    const geometry = kmlCoordsToGeoJson(coordsMatch[1]);
    if (!geometry) continue;

    const center = polygonCenter(geometry);
    const matchKey = normalizeKmlName(rawName);

    results.push({
      kmlName: rawName,
      matchKey,
      geometry,
      centerLat: center.lat,
      centerLng: center.lng,
      vertexCount: geometry.coordinates[0].length - 1,
    });
  }

  return results;
}

const kmlPath =
  process.argv[2] ??
  resolve(process.env.HOME ?? "", "Downloads/COOPER VINEYARD (3).kml");
const outPath = resolve(import.meta.dirname, "../prisma/data/geometry.json");

const kmlText = readFileSync(kmlPath, "utf-8");
const features = parseKml(kmlText);

const output = {
  $schema: "cooper-estate-geometry/v1",
  source: kmlPath,
  extractedAt: new Date().toISOString(),
  estateCenter: { lat: 46.26513, lng: -119.45518 },
  featureCount: features.length,
  features,
};

writeFileSync(outPath, JSON.stringify(output, null, 2));

console.log(`Extracted ${features.length} polygons → ${outPath}`);
for (const f of features) {
  console.log(`  ${f.kmlName} → ${f.matchKey} (${f.vertexCount} vertices)`);
}
