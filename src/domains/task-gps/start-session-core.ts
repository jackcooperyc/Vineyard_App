import { db } from "@/lib/db";
import { notDeletedWhere } from "@/lib/soft-delete";
import { GPS_DEFAULT_SWATH_M } from "@/domains/task-gps/constants";
import { emitTaskEvent } from "@/domains/notifications/delivery";

export async function createGpsSessionForTask(input: {
  taskId: string;
  userId: string;
  blockId?: string;
  swathWidthM?: number;
  skipStatusTransition?: boolean;
}) {
  const existing = await db.taskGpsSession.findFirst({
    where: {
      userId: input.userId,
      status: { in: ["ACTIVE", "PAUSED"] },
    },
  });
  if (existing) {
    return { error: "You already have an active GPS session. End it first." as const };
  }

  const task = await db.task.findFirst({
    where: {
      id: input.taskId,
      ...notDeletedWhere(),
      taskType: { tracksGpsProgress: true, active: true },
    },
    include: {
      taskType: { select: { defaultSwathWidthM: true } },
      taskBlocks: { select: { blockId: true, isPrimary: true } },
    },
  });
  if (!task) {
    return { error: "Task not found or not GPS-eligible" as const };
  }

  const taskBlockIds = task.taskBlocks.map((tb) => tb.blockId);
  let blockId = input.blockId ?? task.blockId;

  if (taskBlockIds.length > 1) {
    if (!input.blockId) {
      return { error: "Block is required for multi-block tasks" as const };
    }
    if (!taskBlockIds.includes(input.blockId)) {
      return { error: "Block is not assigned to this task" as const };
    }
    blockId = input.blockId;
  } else if (taskBlockIds.length === 1 && !taskBlockIds.includes(blockId)) {
    blockId = taskBlockIds[0]!;
  }

  const swathWidthM =
    input.swathWidthM ??
    task.taskType.defaultSwathWidthM ??
    GPS_DEFAULT_SWATH_M;

  const gpsSession = await db.taskGpsSession.create({
    data: {
      taskId: task.id,
      blockId,
      userId: input.userId,
      swathWidthM,
      status: "ACTIVE",
    },
  });

  if (!input.skipStatusTransition && task.status === "PENDING") {
    await db.task.update({
      where: { id: task.id },
      data: {
        status: "IN_PROGRESS",
        startedAt: new Date(),
      },
    });
    const recipients = [task.assignedToId ?? input.userId].filter(
      Boolean,
    ) as string[];
    await emitTaskEvent({
      taskId: task.id,
      eventType: "IN_PROGRESS",
      recipientUserIds: recipients,
      actorUserId: input.userId,
    });
  }

  return { success: true as const, sessionId: gpsSession.id, taskId: task.id };
}
