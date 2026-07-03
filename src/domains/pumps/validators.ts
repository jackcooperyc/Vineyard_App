import { z } from "zod";

export const createIrrigationPumpSchema = z.object({
  name: z.string().min(1, "Name is required").max(120),
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  flowCapacity: z
    .union([z.string(), z.number()])
    .optional()
    .transform((v) => {
      if (v === undefined || v === "") return undefined;
      const n = typeof v === "number" ? v : Number(v);
      return Number.isFinite(n) && n > 0 ? n : undefined;
    }),
  servicedBlockIds: z.array(z.string()).default([]),
  notes: z.string().max(2000).optional(),
});

export type CreateIrrigationPumpInput = z.infer<typeof createIrrigationPumpSchema>;

export const updateIrrigationPumpSchema = createIrrigationPumpSchema.extend({
  pumpId: z.string().min(1, "Pump is required"),
});

export type UpdateIrrigationPumpInput = z.infer<typeof updateIrrigationPumpSchema>;
