"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { TaskStatus } from "@/generated/prisma/client";
import {
  defaultTitleForTypeConfig,
  dueDateFromOffset,
} from "@/domains/tasks/constants";
import { getTaskTypeById } from "@/domains/tasks/type-queries";
import { bulkUpdateTasksSchema } from "@/domains/tasks/type-validators";
import {
  createTaskSchema,
  quickLogTaskSchema,
  updateTaskSchema,
  updateTaskStatusSchema,
} from "@/domains/tasks/validators";

function parseDueDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function revalidateTaskPaths(blockId?: string) {
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/field");
  revalidatePath("/map");
  if (blockId) {
    revalidatePath(`/blocks/${blockId}`);
  }
}

export async function createTask(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const parsed = createTaskSchema.safeParse({
    blockId: formData.get("blockId"),
    taskTypeId: formData.get("taskTypeId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    assignedToId: formData.get("assignedToId") || undefined,
    equipmentId: formData.get("equipmentId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const {
    blockId,
    taskTypeId,
    title,
    description,
    dueDate,
    assignedToId,
    equipmentId,
  } = parsed.data;

  const taskType = await getTaskTypeById(taskTypeId);
  if (!taskType?.active) {
    return { error: "Invalid task type" };
  }

  const task = await db.task.create({
    data: {
      blockId,
      taskTypeId,
      title,
      description,
      dueDate: parseDueDate(dueDate),
      assignedToId: assignedToId || session.user.id,
      equipmentId: equipmentId || null,
      status: "PENDING",
    },
  });

  revalidateTaskPaths(blockId);
  return { success: true, taskId: task.id };
}

export async function quickLogTask(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const blockId = formData.get("blockId") as string;
  const block = await db.block.findUnique({
    where: { id: blockId },
    select: { code: true },
  });

  if (!block) {
    return { error: "Block not found" };
  }

  const parsed = quickLogTaskSchema.safeParse({
    blockId,
    taskTypeId: formData.get("taskTypeId"),
    title: formData.get("title") || undefined,
    description: formData.get("description") || undefined,
    equipmentId: formData.get("equipmentId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { taskTypeId, title, description, equipmentId } = parsed.data;
  const taskType = await getTaskTypeById(taskTypeId);
  if (!taskType?.active) {
    return { error: "Invalid task type" };
  }

  const task = await db.task.create({
    data: {
      blockId,
      taskTypeId,
      title:
        title ??
        defaultTitleForTypeConfig(
          taskType.label,
          block.code,
          taskType.defaultTitleTemplate,
        ),
      description,
      dueDate: dueDateFromOffset(taskType.defaultDueDaysOffset) ?? null,
      assignedToId: session.user.id,
      equipmentId: equipmentId || null,
      status: "PENDING",
    },
  });

  revalidateTaskPaths(blockId);
  return { success: true, taskId: task.id };
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const parsed = updateTaskStatusSchema.safeParse({ taskId, status });
  if (!parsed.success) {
    return { error: "Invalid status update" };
  }

  const task = await db.task.findUnique({
    where: { id: taskId },
    select: { blockId: true },
  });

  if (!task) {
    return { error: "Task not found" };
  }

  await db.task.update({
    where: { id: taskId },
    data: {
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
    },
  });

  revalidateTaskPaths(task.blockId);
  revalidatePath(`/tasks/${taskId}`);
  return { success: true };
}

export async function updateTask(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const parsed = updateTaskSchema.safeParse({
    taskId: formData.get("taskId"),
    blockId: formData.get("blockId"),
    taskTypeId: formData.get("taskTypeId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    assignedToId: formData.get("assignedToId") || undefined,
    equipmentId: formData.get("equipmentId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const {
    taskId,
    blockId,
    taskTypeId,
    title,
    description,
    dueDate,
    assignedToId,
    equipmentId,
  } = parsed.data;

  const existing = await db.task.findUnique({
    where: { id: taskId },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Task not found" };
  }

  const taskType = await getTaskTypeById(taskTypeId);
  if (!taskType?.active) {
    return { error: "Invalid task type" };
  }

  await db.task.update({
    where: { id: taskId },
    data: {
      blockId,
      taskTypeId,
      title,
      description: description || null,
      dueDate: parseDueDate(dueDate) ?? null,
      assignedToId: assignedToId || session.user.id,
      equipmentId: equipmentId || null,
    },
  });

  revalidateTaskPaths(blockId);
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath(`/tasks/${taskId}/edit`);
  return { success: true, taskId };
}

export async function markTaskComplete(taskId: string) {
  return updateTaskStatus(taskId, "COMPLETED");
}

export async function startTask(taskId: string) {
  return updateTaskStatus(taskId, "IN_PROGRESS");
}

export async function deleteTask(taskId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const task = await db.task.findUnique({
    where: { id: taskId },
    select: { blockId: true },
  });

  if (!task) {
    return { error: "Task not found" };
  }

  await db.task.delete({ where: { id: taskId } });

  revalidateTaskPaths(task.blockId);
  return { success: true };
}

export async function bulkUpdateTasks(input: {
  taskIds: string[];
  status?: TaskStatus;
  assignedToId?: string | null;
  taskTypeId?: string;
  dueDate?: string | null;
  clearDueDate?: boolean;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = bulkUpdateTasksSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { taskIds, status, assignedToId, taskTypeId, dueDate, clearDueDate } =
    parsed.data;

  if (taskTypeId) {
    const taskType = await getTaskTypeById(taskTypeId);
    if (!taskType?.active) return { error: "Invalid task type" };
  }

  const data: {
    status?: TaskStatus;
    assignedToId?: string | null;
    taskTypeId?: string;
    dueDate?: Date | null;
    completedAt?: Date | null;
  } = {};

  if (status) {
    data.status = status;
    data.completedAt = status === "COMPLETED" ? new Date() : null;
  }
  if (assignedToId !== undefined) {
    data.assignedToId = assignedToId || null;
  }
  if (taskTypeId) {
    data.taskTypeId = taskTypeId;
  }
  if (clearDueDate) {
    data.dueDate = null;
  } else if (dueDate) {
    data.dueDate = parseDueDate(dueDate) ?? null;
  }

  if (Object.keys(data).length === 0) {
    return { error: "No updates specified" };
  }

  const result = await db.task.updateMany({
    where: { id: { in: taskIds } },
    data,
  });

  revalidateTaskPaths();
  return { success: true, count: result.count };
}
