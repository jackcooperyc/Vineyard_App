import { z } from "zod";

export const blockStatusSchema = z.enum(["ACTIVE", "FALLOW", "REPLANTING"]);
export const growthStageSchema = z.enum(["DORMANT"]);

export const updateBlockSchema = z.object({
  blockId: z.string().min(1),
  name: z.string().min(1, "Name is required").max(200),
  status: blockStatusSchema,
  acreage: z.string().optional(),
  notes: z.string().max(5000).optional(),
  growthStage: growthStageSchema.optional().nullable(),
});

export const createPlantingSchema = z.object({
  blockId: z.string().min(1),
  varietyId: z.string().min(1, "Variety is required"),
  vineCount: z.string().optional(),
  yearPlanted: z.string().optional(),
  rootstock: z.string().max(100).optional(),
  rowSpacing: z.string().optional(),
  vineSpacing: z.string().optional(),
});

export const updatePlantingSchema = createPlantingSchema.extend({
  plantingId: z.string().min(1),
});

export const deletePlantingSchema = z.object({
  plantingId: z.string().min(1),
  blockId: z.string().min(1),
});
