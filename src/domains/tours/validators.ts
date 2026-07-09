import { z } from "zod";
import { TOUR_POI_CATEGORIES } from "@/domains/tours/constants";

const tourPoiCategorySchema = z.enum(TOUR_POI_CATEGORIES);

const latLngSchema = {
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
};

export const createTourPOISchema = z.object({
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  category: tourPoiCategorySchema,
  ...latLngSchema,
});

export type CreateTourPOIInput = z.infer<typeof createTourPOISchema>;

export const updateTourPOISchema = createTourPOISchema.extend({
  poiId: z.string().min(1, "POI is required"),
});

export type UpdateTourPOIInput = z.infer<typeof updateTourPOISchema>;

export const relocateTourPOISchema = z.object({
  poiId: z.string().min(1, "POI is required"),
  ...latLngSchema,
});

export type RelocateTourPOIInput = z.infer<typeof relocateTourPOISchema>;

export const deleteTourPOISchema = z.object({
  poiId: z.string().min(1, "POI is required"),
});
