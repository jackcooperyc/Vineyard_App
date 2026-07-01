import { z } from "zod";

export const taskTypeSchema = z.enum([
  "PRUNING",
  "SPRAYING",
  "HARVESTING",
  "INSPECTION",
  "OTHER",
]);

export const taskStatusSchema = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const createTaskSchema = z.object({
  blockId: z.string().min(1, "Block is required"),
  type: taskTypeSchema,
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().optional(),
  assignedToId: z.string().optional(),
});

export const quickLogTaskSchema = z.object({
  blockId: z.string().min(1),
  type: taskTypeSchema,
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.string().min(1),
  status: taskStatusSchema,
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type QuickLogTaskInput = z.infer<typeof quickLogTaskSchema>;
