"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-session";
import { db } from "@/lib/db";
import type { TaskStatus } from "@/generated/prisma/client";
import {
  defaultTitleForTypeConfig,
  dueDateFromOffset,
} from "@/domains/tasks/constants";
import { getTaskTypeById } from "@/domains/tasks/type-queries";
import { bulkUpdateTasksSchema } from "@/domains/tasks/type-validators";
import {
  parseCreateTaskFromForm,
  parseQuickLogTaskFromForm,
  parseUpdateTaskFromForm,
  updateTaskStatusSchema,
} from "@/domains/tasks/validators";
import {
  resolvePrimaryBlockId,
  syncTaskBlocks,
  validateBlockIds,
} from "@/domains/tasks/task-blocks";
import { createGpsSessionForTask } from "@/domains/task-gps/start-session-core";
import { notDeletedWhere } from "@/lib/soft-delete";
import { purgeExpiredSoftDeletes } from "@/lib/soft-delete-purge";
import {
  emitTaskEvent,
  statusTransitionEvent,
} from "@/domains/notifications/delivery";

function parseDueDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function revalidateTaskPaths(blockIds?: string[]) {
  revalidatePath("/tasks");
  revalidatePath("/dashboard");
  revalidatePath("/field");
  revalidatePath("/map");
  if (blockIds) {
    for (const blockId of blockIds) {
      revalidatePath(`/blocks/${blockId}`);
    }
  }
}

export async function beginTask(
  taskId: string,
  options?: { actorUserId?: string; autoStartGps?: boolean },
) {
  let actorUserId = options?.actorUserId;
  if (!actorUserId) {
    const authResult = await requirePermission("tasks:update");
    if ("error" in authResult) return { error: authResult.error };
    actorUserId = authResult.user.id;
  }

  const task = await db.task.findFirst({
    where: { id: taskId, ...notDeletedWhere() },
    include: {
      taskType: { select: { tracksGpsProgress: true } },
      taskBlocks: { select: { blockId: true, isPrimary: true } },
    },
  });

  if (!task) {
    return { error: "Task not found" };
  }

  const now = new Date();
  const wasPending = task.status === "PENDING";

  await db.task.update({
    where: { id: taskId },
    data: {
      status: "IN_PROGRESS",
      startedAt: task.startedAt ?? now,
    },
  });

  if (wasPending) {
    const recipients = [task.assignedToId ?? actorUserId].filter(
      Boolean,
    ) as string[];
    await emitTaskEvent({
      taskId,
      eventType: "IN_PROGRESS",
      recipientUserIds: recipients,
      actorUserId,
    });
  }

  let sessionId: string | undefined;
  const shouldStartGps =
    options?.autoStartGps !== false && task.taskType.tracksGpsProgress;

  if (shouldStartGps) {
    const primaryBlock =
      task.taskBlocks.find((tb) => tb.isPrimary)?.blockId ?? task.blockId;
    const gpsResult = await createGpsSessionForTask({
      taskId,
      userId: actorUserId,
      blockId: primaryBlock,
      skipStatusTransition: true,
    });
    if ("sessionId" in gpsResult && gpsResult.sessionId) {
      sessionId = gpsResult.sessionId;
    }
  }

  revalidateTaskPaths(task.taskBlocks.map((tb) => tb.blockId));
  revalidatePath(`/tasks/${taskId}`);

  return { success: true, taskId, sessionId, tracksGps: shouldStartGps };
}

export async function createTask(formData: FormData) {
  const authResult = await requirePermission("tasks:create");
  if ("error" in authResult) return { error: authResult.error };
  const user = authResult.user;

  const parsed = parseCreateTaskFromForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const {
    blockIds,
    primaryBlockId,
    taskTypeId,
    title,
    description,
    dueDate,
    assignedToId,
    equipmentId,
    beginTask: shouldBegin,
  } = parsed.data;

  const primary = resolvePrimaryBlockId(blockIds, primaryBlockId);

  const blockValidation = await validateBlockIds(blockIds);
  if (blockValidation.error) {
    return { error: blockValidation.error };
  }

  const taskType = await getTaskTypeById(taskTypeId);
  if (!taskType?.active) {
    return { error: "Invalid task type" };
  }

  const task = await db.$transaction(async (tx) => {
    const created = await tx.task.create({
      data: {
        blockId: primary,
        taskTypeId,
        title,
        description,
        dueDate: parseDueDate(dueDate),
        assignedToId: assignedToId || user.id,
        createdById: user.id,
        equipmentId: equipmentId || null,
        status: "PENDING",
      },
    });

    await syncTaskBlocks(created.id, blockIds, primary, tx);
    return created;
  });

  const assigneeId = assignedToId || user.id;
  await emitTaskEvent({
    taskId: task.id,
    eventType: "CREATED",
    recipientUserIds: [user.id],
    actorUserId: user.id,
  });
  if (assigneeId) {
    await emitTaskEvent({
      taskId: task.id,
      eventType: "ASSIGNED",
      recipientUserIds: [assigneeId],
      actorUserId: user.id,
    });
  }

  let sessionId: string | undefined;
  let tracksGps = false;

  if (shouldBegin) {
    tracksGps = taskType.tracksGpsProgress;
    const beginResult = await beginTask(task.id, {
      actorUserId: user.id,
    });
    if ("sessionId" in beginResult && beginResult.sessionId) {
      sessionId = beginResult.sessionId;
    }
  }

  revalidateTaskPaths(blockIds);
  return {
    success: true,
    taskId: task.id,
    sessionId,
    tracksGps,
    began: !!shouldBegin,
  };
}

export async function quickLogTask(formData: FormData) {
  const authResult = await requirePermission("tasks:create");
  if ("error" in authResult) return { error: authResult.error };
  const user = authResult.user;

  const fallbackBlockId = formData.get("blockId") as string | null;
  const parsed = parseQuickLogTaskFromForm(formData, fallbackBlockId ?? undefined);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const {
    blockIds,
    primaryBlockId,
    taskTypeId,
    title,
    description,
    equipmentId,
    beginTask: shouldBegin,
  } = parsed.data;

  const primary = resolvePrimaryBlockId(blockIds, primaryBlockId);

  const blockValidation = await validateBlockIds(blockIds);
  if (blockValidation.error) {
    return { error: blockValidation.error };
  }

  const primaryBlock = await db.block.findUnique({
    where: { id: primary },
    select: { code: true },
  });

  if (!primaryBlock) {
    return { error: "Block not found" };
  }

  const { taskTypeId: typeId, title: taskTitle, description: taskDesc, equipmentId: equipId } = {
    taskTypeId,
    title,
    description,
    equipmentId,
  };

  const taskType = await getTaskTypeById(typeId);
  if (!taskType?.active) {
    return { error: "Invalid task type" };
  }

  const task = await db.$transaction(async (tx) => {
    const created = await tx.task.create({
      data: {
        blockId: primary,
        taskTypeId: typeId,
        title:
          taskTitle ??
          defaultTitleForTypeConfig(
            taskType.label,
            primaryBlock.code,
            taskType.defaultTitleTemplate,
          ),
        description: taskDesc,
        dueDate: dueDateFromOffset(taskType.defaultDueDaysOffset) ?? null,
        assignedToId: user.id,
        createdById: user.id,
        equipmentId: equipId || null,
        status: "PENDING",
      },
    });

    await syncTaskBlocks(created.id, blockIds, primary, tx);
    return created;
  });

  await emitTaskEvent({
    taskId: task.id,
    eventType: "CREATED",
    recipientUserIds: [user.id],
    actorUserId: user.id,
  });
  await emitTaskEvent({
    taskId: task.id,
    eventType: "ASSIGNED",
    recipientUserIds: [user.id],
    actorUserId: user.id,
  });

  let sessionId: string | undefined;
  let tracksGps = false;

  if (shouldBegin) {
    tracksGps = taskType.tracksGpsProgress;
    const beginResult = await beginTask(task.id, {
      actorUserId: user.id,
    });
    if ("sessionId" in beginResult && beginResult.sessionId) {
      sessionId = beginResult.sessionId;
    }
  }

  revalidateTaskPaths(blockIds);
  return {
    success: true,
    taskId: task.id,
    sessionId,
    tracksGps,
    began: !!shouldBegin,
  };
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const authResult = await requirePermission("tasks:update");
  if ("error" in authResult) return { error: authResult.error };
  const user = authResult.user;

  const parsed = updateTaskStatusSchema.safeParse({ taskId, status });
  if (!parsed.success) {
    return { error: "Invalid status update" };
  }

  const task = await db.task.findFirst({
    where: { id: taskId, ...notDeletedWhere() },
    select: {
      blockId: true,
      status: true,
      assignedToId: true,
      startedAt: true,
      taskBlocks: { select: { blockId: true } },
    },
  });

  if (!task) {
    return { error: "Task not found" };
  }

  const previousStatus = task.status;

  await db.task.update({
    where: { id: taskId },
    data: {
      status,
      completedAt: status === "COMPLETED" ? new Date() : null,
      ...(status === "IN_PROGRESS" && !task.startedAt
        ? { startedAt: new Date() }
        : {}),
    },
  });

  const eventType = statusTransitionEvent(previousStatus, status);
  if (eventType && task.assignedToId) {
    await emitTaskEvent({
      taskId,
      eventType,
      recipientUserIds: [task.assignedToId],
      actorUserId: user.id,
    });
  }

  revalidateTaskPaths(task.taskBlocks.map((tb) => tb.blockId));
  revalidatePath(`/tasks/${taskId}`);
  return { success: true };
}

export async function updateTask(formData: FormData) {
  const authResult = await requirePermission("tasks:update");
  if ("error" in authResult) return { error: authResult.error };
  const user = authResult.user;

  const parsed = parseUpdateTaskFromForm(formData);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const {
    taskId,
    blockIds,
    primaryBlockId,
    taskTypeId,
    title,
    description,
    dueDate,
    assignedToId,
    equipmentId,
  } = parsed.data;

  const primary = resolvePrimaryBlockId(blockIds, primaryBlockId);

  const blockValidation = await validateBlockIds(blockIds);
  if (blockValidation.error) {
    return { error: blockValidation.error };
  }

  const existing = await db.task.findFirst({
    where: { id: taskId, ...notDeletedWhere() },
    select: { id: true, assignedToId: true },
  });

  if (!existing) {
    return { error: "Task not found" };
  }

  const taskType = await getTaskTypeById(taskTypeId);
  if (!taskType?.active) {
    return { error: "Invalid task type" };
  }

  const nextAssigneeId = assignedToId || user.id;

  await db.$transaction(async (tx) => {
    await tx.task.update({
      where: { id: taskId },
      data: {
        blockId: primary,
        taskTypeId,
        title,
        description: description || null,
        dueDate: parseDueDate(dueDate) ?? null,
        assignedToId: nextAssigneeId,
        equipmentId: equipmentId || null,
      },
    });

    await syncTaskBlocks(taskId, blockIds, primary, tx);
  });

  if (nextAssigneeId !== existing.assignedToId) {
    await emitTaskEvent({
      taskId,
      eventType: "ASSIGNED",
      recipientUserIds: [nextAssigneeId],
      actorUserId: user.id,
    });
  }

  revalidateTaskPaths(blockIds);
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath(`/tasks/${taskId}/edit`);
  return { success: true, taskId };
}

export async function markTaskComplete(taskId: string) {
  return updateTaskStatus(taskId, "COMPLETED");
}

export async function startTask(taskId: string) {
  return beginTask(taskId);
}

export async function deleteTask(taskId: string) {
  const authResult = await requirePermission("tasks:delete");
  if ("error" in authResult) return { error: authResult.error };

  await purgeExpiredSoftDeletes();

  const task = await db.task.findFirst({
    where: { id: taskId, ...notDeletedWhere() },
    select: { blockId: true, taskBlocks: { select: { blockId: true } } },
  });

  if (!task) {
    return { error: "Task not found" };
  }

  await db.task.update({
    where: { id: taskId },
    data: { deletedAt: new Date() },
  });

  revalidateTaskPaths(task.taskBlocks.map((tb) => tb.blockId));
  revalidatePath(`/tasks/${taskId}`);
  return { success: true };
}

export async function restoreTask(taskId: string) {
  const authResult = await requirePermission("tasks:delete");
  if ("error" in authResult) return { error: authResult.error };

  await purgeExpiredSoftDeletes();

  const task = await db.task.findFirst({
    where: { id: taskId, deletedAt: { not: null } },
    select: {
      blockId: true,
      deletedAt: true,
      taskBlocks: { select: { blockId: true } },
    },
  });

  if (!task?.deletedAt) {
    return { error: "Deleted task not found" };
  }

  await db.task.update({
    where: { id: taskId },
    data: { deletedAt: null },
  });

  revalidateTaskPaths(task.taskBlocks.map((tb) => tb.blockId));
  revalidatePath(`/tasks/${taskId}`);
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
  const authResult = await requirePermission("tasks:update");
  if ("error" in authResult) return { error: authResult.error };
  const user = authResult.user;

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
    startedAt?: Date;
  } = {};

  if (status) {
    data.status = status;
    data.completedAt = status === "COMPLETED" ? new Date() : null;
    if (status === "IN_PROGRESS") {
      data.startedAt = new Date();
    }
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

  const tasksBefore = await db.task.findMany({
    where: { id: { in: taskIds }, ...notDeletedWhere() },
    select: { id: true, status: true, assignedToId: true, startedAt: true },
  });

  const result = await db.task.updateMany({
    where: { id: { in: taskIds }, ...notDeletedWhere() },
    data,
  });

  for (const task of tasksBefore) {
    if (status) {
      const eventType = statusTransitionEvent(task.status, status);
      if (eventType && task.assignedToId) {
        await emitTaskEvent({
          taskId: task.id,
          eventType,
          recipientUserIds: [task.assignedToId],
          actorUserId: user.id,
        });
      }
    }

    if (
      assignedToId !== undefined &&
      assignedToId !== task.assignedToId &&
      assignedToId
    ) {
      await emitTaskEvent({
        taskId: task.id,
        eventType: "ASSIGNED",
        recipientUserIds: [assignedToId],
        actorUserId: user.id,
      });
    }
  }

  revalidateTaskPaths();
  return { success: true, count: result.count };
}
