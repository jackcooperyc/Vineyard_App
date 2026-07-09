import type { TourPOICategory } from "@/domains/tours/constants";

export type MapTourPOIGeo = {
  id: string;
  title: string;
  description: string | null;
  category: TourPOICategory;
  coordinates: [number, number];
};

export function mapTourPOIsToGeoJSON(pois: MapTourPOIGeo[]) {
  return {
    type: "FeatureCollection" as const,
    features: pois.map((poi) => ({
      type: "Feature" as const,
      id: poi.id,
      geometry: {
        type: "Point" as const,
        coordinates: poi.coordinates,
      },
      properties: {
        poiId: poi.id,
        title: poi.title,
        category: poi.category,
      },
    })),
  };
}
