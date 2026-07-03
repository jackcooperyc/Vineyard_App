import { z } from "zod";
import { isAllowedTaskTypeIcon } from "@/domains/tasks/type-icons";

export const taskTypeSlugSchema = z
  .string()
  .min(1)
  .max(64)
  .regex(/^[A-Z][A-Z0-9_]*$/, "Slug must be UPPER_SNAKE_CASE");

export const createTaskTypeSchema = z.object({
  label: z.string().min(1, "Label is required").max(80),
  slug: taskTypeSlugSchema,
  iconName: z
    .string()
    .min(1)
    .refine(isAllowedTaskTypeIcon, "Invalid icon"),
  colorHex: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/)
    .optional()
    .or(z.literal("")),
  showInQuickLog: z.coerce.boolean().optional(),
  defaultTitleTemplate: z.string().max(200).optional(),
  defaultDueDaysOffset: z.coerce.number().int().min(0).max(365).optional(),
  active: z.coerce.boolean().optional(),
});

export const updateTaskTypeSchema = createTaskTypeSchema.extend({
  taskTypeId: z.string().min(1),
});

export const reorderTaskTypesSchema = z.object({
  orderedIds: z.array(z.string().min(1)).min(1),
});

export const bulkUpdateTasksSchema = z.object({
  taskIds: z.array(z.string().min(1)).min(1),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"]).optional(),
  assignedToId: z.string().optional().nullable(),
  taskTypeId: z.string().optional(),
  dueDate: z.string().optional().nullable(),
  clearDueDate: z.coerce.boolean().optional(),
});
