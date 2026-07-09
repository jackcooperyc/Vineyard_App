/** Extensible tour POI categories — keep in sync with Prisma `TourPOICategory` enum. */
export const TOUR_POI_CATEGORIES = [
  "MILESTONE",
  "FAMILY",
  "VARIETAL",
  "TERROIR",
  "CLUB_STORY",
  "HYPE_FUTURE_EXPERIENCE",
  "PHOTO_OPPORTUNITY",
  "TASTING_BAR",
  "BATHROOM_ACCESS",
] as const;

export type TourPOICategory = (typeof TOUR_POI_CATEGORIES)[number];

export const TOUR_POI_CATEGORY_LABELS: Record<TourPOICategory, string> = {
  MILESTONE: "Milestone",
  FAMILY: "Family",
  VARIETAL: "Varietal",
  TERROIR: "Terroir",
  CLUB_STORY: "Club story",
  HYPE_FUTURE_EXPERIENCE: "Hype / future experience",
  PHOTO_OPPORTUNITY: "Photo opportunity",
  TASTING_BAR: "Tasting bar",
  BATHROOM_ACCESS: "Bathroom access",
};

/** Map pin color for tour POIs (distinct from irrigation pump blue). */
export const TOUR_POI_MARKER_COLOR = "#f59e0b";
