import { z } from "zod";

export const irrigationStatusSchema = z.enum([
  "SCHEDULED",
  "APPLIED",
  "MISSED",
  "SKIPPED",
]);

export const createScheduleSchema = z.object({
  blockId: z.string().min(1, "Block is required"),
  frequency: z.string().min(1, "Frequency is required"),
  startDate: z.string().min(1, "Start date is required"),
  volume: z.string().optional(),
  method: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export const createRecordSchema = z.object({
  blockId: z.string().min(1, "Block is required"),
  appliedAt: z.string().min(1, "Date is required"),
  scheduledAt: z.string().optional(),
  volume: z.string().optional(),
  duration: z.string().optional(),
  method: z.string().optional(),
  status: irrigationStatusSchema.default("APPLIED"),
  notes: z.string().max(2000).optional(),
});

export const quickLogRecordSchema = z.object({
  blockId: z.string().min(1),
  appliedAt: z.string().optional(),
  volume: z.string().optional(),
  duration: z.string().optional(),
  method: z.string().optional(),
  notes: z.string().max(500).optional(),
});
