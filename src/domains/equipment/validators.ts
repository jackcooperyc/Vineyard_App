import { z } from "zod";

export const equipmentStatusSchema = z.enum([
  "ACTIVE",
  "IN_MAINTENANCE",
  "RETIRED",
]);

export const createEquipmentSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  type: z.string().min(1, "Type is required").max(100),
  status: equipmentStatusSchema.default("ACTIVE"),
  serialNumber: z.string().max(100).optional(),
  lastServicedAt: z.string().optional(),
  nextServiceAt: z.string().optional(),
  notes: z.string().max(2000).optional(),
});

export const createMaintenanceRecordSchema = z.object({
  equipmentId: z.string().min(1),
  performedAt: z.string().min(1, "Date is required"),
  description: z.string().max(500).optional(),
  notes: z.string().max(2000).optional(),
  nextServiceAt: z.string().optional(),
});

export const updateEquipmentStatusSchema = z.object({
  equipmentId: z.string().min(1),
  status: equipmentStatusSchema,
});
