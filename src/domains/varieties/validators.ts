import { z } from "zod";

export const colorHexSchema = z
  .string()
  .regex(/^#[0-9A-Fa-f]{6}$/, "Must be a valid hex color (#RRGGBB)");

export const updateVarietyColorSchema = z.object({
  varietyId: z.string().min(1),
  colorHex: colorHexSchema,
});

export const updateMapColorModeSchema = z.object({
  mapColorMode: z.enum(["STATUS", "VARIETAL"]),
});
