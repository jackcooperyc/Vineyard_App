import { z } from "zod";
import { MAP_SPACE_CATEGORIES } from "@/domains/map/constants";

const polygonGeometrySchema = z.object({
  type: z.literal("Polygon"),
  coordinates: z
    .array(
      z.array(z.tuple([z.number(), z.number()])).min(4, "Polygon needs at least 3 vertices"),
    )
    .length(1),
});

export const createMapSpaceSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  category: z.enum(MAP_SPACE_CATEGORIES),
  geometry: polygonGeometrySchema,
});

export const updateMapSpaceSchema = z.object({
  blockId: z.string().min(1),
  name: z.string().min(1, "Name is required").max(200),
  category: z.enum(MAP_SPACE_CATEGORIES),
  geometry: polygonGeometrySchema.optional(),
});

export const deleteMapSpaceSchema = z.object({
  blockId: z.string().min(1),
});
