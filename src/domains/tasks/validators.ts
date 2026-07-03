import { z } from "zod";

export const taskStatusSchema = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

export const createTaskSchema = z.object({
  blockId: z.string().min(1, "Block is required"),
  taskTypeId: z.string().min(1, "Task type is required"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().optional(),
  assignedToId: z.string().optional(),
  equipmentId: z.string().optional(),
});

export const quickLogTaskSchema = z.object({
  blockId: z.string().min(1),
  taskTypeId: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  equipmentId: z.string().optional(),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.string().min(1),
  status: taskStatusSchema,
});

export const updateTaskSchema = createTaskSchema.extend({
  taskId: z.string().min(1, "Task is required"),
});

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type QuickLogTaskInput = z.infer<typeof quickLogTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
