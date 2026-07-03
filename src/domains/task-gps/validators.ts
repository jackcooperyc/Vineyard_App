import { z } from "zod";
import { GPS_MAX_ACCURACY_M, GPS_POINT_BATCH_MAX } from "@/domains/task-gps/constants";

export const gpsPointSchema = z.object({
  lat: z.number().min(-90).max(90),
  lng: z.number().min(-180).max(180),
  accuracyM: z.number().min(0).optional(),
  speedMps: z.number().min(0).optional(),
  heading: z.number().min(0).max(360).optional(),
  recordedAt: z.string().datetime(),
});

export const appendGpsPointsSchema = z.object({
  sessionId: z.string().min(1),
  points: z.array(gpsPointSchema).min(1).max(GPS_POINT_BATCH_MAX),
});

export const startGpsSessionSchema = z.object({
  taskId: z.string().min(1),
  blockId: z.string().min(1).optional(),
  swathWidthM: z.coerce.number().min(0.5).max(50).optional(),
});

export const switchGpsSessionBlockSchema = z.object({
  sessionId: z.string().min(1),
  blockId: z.string().min(1),
});

export const sessionIdSchema = z.object({
  sessionId: z.string().min(1),
});

export function isGpsPointAccurate(accuracyM?: number | null): boolean {
  if (accuracyM == null) return true;
  return accuracyM <= GPS_MAX_ACCURACY_M;
}
