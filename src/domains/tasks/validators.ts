import { z } from "zod";

export const taskStatusSchema = z.enum([
  "PENDING",
  "IN_PROGRESS",
  "COMPLETED",
  "CANCELLED",
]);

const blockIdsField = z
  .array(z.string().min(1))
  .min(1, "At least one block is required");

function parseBlockIdsFromForm(
  blockIdsRaw: FormDataEntryValue | null,
  blockIdRaw: FormDataEntryValue | null,
): string[] {
  if (typeof blockIdsRaw === "string" && blockIdsRaw.trim()) {
    try {
      const parsed = JSON.parse(blockIdsRaw) as unknown;
      if (Array.isArray(parsed) && parsed.every((id) => typeof id === "string")) {
        return parsed;
      }
    } catch {
      // fall through
    }
  }
  if (typeof blockIdRaw === "string" && blockIdRaw) {
    return [blockIdRaw];
  }
  return [];
}

export const createTaskSchema = z.object({
  blockIds: blockIdsField,
  primaryBlockId: z.string().optional(),
  taskTypeId: z.string().min(1, "Task type is required"),
  title: z.string().min(1, "Title is required").max(200),
  description: z.string().max(2000).optional(),
  dueDate: z.string().optional(),
  assignedToId: z.string().optional(),
  equipmentId: z.string().optional(),
  beginTask: z.coerce.boolean().optional(),
});

export const quickLogTaskSchema = z.object({
  blockIds: blockIdsField,
  primaryBlockId: z.string().optional(),
  taskTypeId: z.string().min(1),
  title: z.string().min(1).max(200).optional(),
  description: z.string().max(500).optional(),
  equipmentId: z.string().optional(),
  beginTask: z.coerce.boolean().optional(),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.string().min(1),
  status: taskStatusSchema,
});

export const updateTaskSchema = createTaskSchema.extend({
  taskId: z.string().min(1, "Task is required"),
});

export function parseCreateTaskFromForm(formData: FormData) {
  const blockIds = parseBlockIdsFromForm(
    formData.get("blockIds"),
    formData.get("blockId"),
  );
  return createTaskSchema.safeParse({
    blockIds,
    primaryBlockId: formData.get("primaryBlockId") || undefined,
    taskTypeId: formData.get("taskTypeId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    assignedToId: formData.get("assignedToId") || undefined,
    equipmentId: formData.get("equipmentId") || undefined,
    beginTask: formData.get("beginTask"),
  });
}

export function parseQuickLogTaskFromForm(
  formData: FormData,
  fallbackBlockId?: string,
) {
  const blockIds = parseBlockIdsFromForm(
    formData.get("blockIds"),
    formData.get("blockId") ?? fallbackBlockId ?? null,
  );
  return quickLogTaskSchema.safeParse({
    blockIds,
    primaryBlockId: formData.get("primaryBlockId") || undefined,
    taskTypeId: formData.get("taskTypeId"),
    title: formData.get("title") || undefined,
    description: formData.get("description") || undefined,
    equipmentId: formData.get("equipmentId") || undefined,
    beginTask: formData.get("beginTask"),
  });
}

export function parseUpdateTaskFromForm(formData: FormData) {
  const blockIds = parseBlockIdsFromForm(
    formData.get("blockIds"),
    formData.get("blockId"),
  );
  return updateTaskSchema.safeParse({
    taskId: formData.get("taskId"),
    blockIds,
    primaryBlockId: formData.get("primaryBlockId") || undefined,
    taskTypeId: formData.get("taskTypeId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    assignedToId: formData.get("assignedToId") || undefined,
    equipmentId: formData.get("equipmentId") || undefined,
  });
}

export type CreateTaskInput = z.infer<typeof createTaskSchema>;
export type QuickLogTaskInput = z.infer<typeof quickLogTaskSchema>;
export type UpdateTaskInput = z.infer<typeof updateTaskSchema>;
