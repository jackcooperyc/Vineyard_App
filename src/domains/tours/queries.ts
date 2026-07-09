import { db } from "@/lib/db";
import type { TourPOICategory } from "@/domains/tours/constants";
import { mapTourPOIsToGeoJSON, type MapTourPOIGeo } from "@/domains/tours/map-geo";

export { mapTourPOIsToGeoJSON };

export type TourPOIListItem = {
  id: string;
  title: string;
  description: string | null;
  category: TourPOICategory;
  gpsPoint: { type: "Point"; coordinates: [number, number] };
};

function parseGpsPoint(
  gpsPoint: unknown,
): { type: "Point"; coordinates: [number, number] } | null {
  if (
    gpsPoint &&
    typeof gpsPoint === "object" &&
    "type" in gpsPoint &&
    gpsPoint.type === "Point" &&
    "coordinates" in gpsPoint &&
    Array.isArray(gpsPoint.coordinates) &&
    gpsPoint.coordinates.length >= 2
  ) {
    const [lng, lat] = gpsPoint.coordinates;
    if (typeof lng === "number" && typeof lat === "number") {
      return { type: "Point", coordinates: [lng, lat] };
    }
  }
  return null;
}

export async function getTourPOIs(): Promise<TourPOIListItem[]> {
  const pois = await db.tourPOI.findMany({
    orderBy: { title: "asc" },
  });

  return pois
    .map((poi) => {
      const gpsPoint = parseGpsPoint(poi.gpsPoint);
      if (!gpsPoint) return null;
      return {
        id: poi.id,
        title: poi.title,
        description: poi.description,
        category: poi.category,
        gpsPoint,
      };
    })
    .filter((p): p is TourPOIListItem => p != null);
}

export async function getTourPOIById(id: string) {
  const poi = await db.tourPOI.findUnique({ where: { id } });
  if (!poi) return null;

  const gpsPoint = parseGpsPoint(poi.gpsPoint);
  if (!gpsPoint) return null;

  return { ...poi, gpsPoint };
}

export async function getMapTourPOIs(): Promise<MapTourPOIGeo[]> {
  const pois = await db.tourPOI.findMany({
    select: {
      id: true,
      title: true,
      description: true,
      category: true,
      gpsPoint: true,
    },
  });

  return pois
    .map((poi) => {
      const parsed = parseGpsPoint(poi.gpsPoint);
      if (!parsed) return null;
      return {
        id: poi.id,
        title: poi.title,
        description: poi.description,
        category: poi.category,
        coordinates: parsed.coordinates,
      };
    })
    .filter((p): p is MapTourPOIGeo => p != null);
}
