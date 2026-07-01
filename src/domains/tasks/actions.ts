"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { TaskStatus } from "@/generated/prisma/client";
import {
  createTaskSchema,
  quickLogTaskSchema,
  updateTaskStatusSchema,
} from "@/domains/tasks/validators";
import { defaultTitleForType } from "@/domains/tasks/constants";

function parseDueDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function revalidateTaskPaths(blockId?: string) {
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
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
    type: formData.get("type"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    dueDate: formData.get("dueDate") || undefined,
    assignedToId: formData.get("assignedToId") || undefined,
    equipmentId: formData.get("equipmentId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { blockId, type, title, description, dueDate, assignedToId, equipmentId } =
    parsed.data;

  const task = await db.task.create({
    data: {
      blockId,
      type,
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
    type: formData.get("type"),
    title: formData.get("title") || undefined,
    description: formData.get("description") || undefined,
    equipmentId: formData.get("equipmentId") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { type, title, description, equipmentId } = parsed.data;

  const task = await db.task.create({
    data: {
      blockId,
      type,
      title: title ?? defaultTitleForType(type, block.code),
      description,
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

export async function markTaskComplete(taskId: string) {
  return updateTaskStatus(taskId, "COMPLETED");
}

export async function startTask(taskId: string) {
  return updateTaskStatus(taskId, "IN_PROGRESS");
}
