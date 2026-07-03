"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notDeletedWhere } from "@/lib/soft-delete";
import { GPS_AUTO_COMPLETE_COVERAGE } from "@/domains/task-gps/constants";
import {
  appendGpsPointsSchema,
  isGpsPointAccurate,
  sessionIdSchema,
  startGpsSessionSchema,
  switchGpsSessionBlockSchema,
} from "@/domains/task-gps/validators";
import { emitTaskEvent } from "@/domains/notifications/delivery";
import {
  getActiveGpsSessionForUser,
  getOpenGpsEligibleTasks,
} from "@/domains/task-gps/queries";
import { GPS_MIN_MOVE_M } from "@/domains/task-gps/constants";
import {
  createGpsSessionForTask,
  haversineM,
  refreshSessionProgress,
} from "@/domains/task-gps/session-progress";

function revalidateGpsPaths(taskId: string) {
  revalidatePath("/field");
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${taskId}`);
  revalidatePath("/dashboard");
  revalidatePath("/map");
}

export async function startGpsSession(input: {
  taskId: string;
  blockId?: string;
  swathWidthM?: number;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = startGpsSessionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const result = await createGpsSessionForTask({
    taskId: parsed.data.taskId,
    userId: session.user.id,
    blockId: parsed.data.blockId,
    swathWidthM: parsed.data.swathWidthM,
  });

  if ("error" in result) {
    return { error: result.error };
  }

  revalidateGpsPaths(result.taskId);
  return { success: true, sessionId: result.sessionId };
}

export async function switchGpsSessionBlock(input: {
  sessionId: string;
  blockId: string;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = switchGpsSessionBlockSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const row = await db.taskGpsSession.findFirst({
    where: {
      id: parsed.data.sessionId,
      userId: session.user.id,
      status: { in: ["ACTIVE", "PAUSED"] },
    },
    include: {
      task: {
        select: {
          id: true,
          taskBlocks: { select: { blockId: true } },
        },
      },
    },
  });
  if (!row) return { error: "Active session not found" };

  const taskBlockIds = row.task.taskBlocks.map((tb) => tb.blockId);
  if (taskBlockIds.length > 1 && !taskBlockIds.includes(parsed.data.blockId)) {
    return { error: "Block is not assigned to this task" };
  }

  if (row.blockId === parsed.data.blockId) {
    return { success: true, sessionId: row.id };
  }

  await refreshSessionProgress(row.id);

  await db.taskGpsSession.update({
    where: { id: row.id },
    data: { status: "COMPLETED", endedAt: new Date() },
  });

  const next = await createGpsSessionForTask({
    taskId: row.taskId,
    userId: session.user.id,
    blockId: parsed.data.blockId,
    swathWidthM: row.swathWidthM ?? undefined,
    skipStatusTransition: true,
  });

  if ("error" in next) {
    return { error: next.error };
  }

  revalidateGpsPaths(row.taskId);
  return { success: true, sessionId: next.sessionId };
}

export async function pauseGpsSession(sessionId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const row = await db.taskGpsSession.findFirst({
    where: { id: sessionId, userId: session.user.id, status: "ACTIVE" },
  });
  if (!row) return { error: "Active session not found" };

  await db.taskGpsSession.update({
    where: { id: sessionId },
    data: { status: "PAUSED" },
  });

  return { success: true };
}

export async function resumeGpsSession(sessionId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const row = await db.taskGpsSession.findFirst({
    where: { id: sessionId, userId: session.user.id, status: "PAUSED" },
  });
  if (!row) return { error: "Paused session not found" };

  await db.taskGpsSession.update({
    where: { id: sessionId },
    data: { status: "ACTIVE" },
  });

  return { success: true };
}

export async function endGpsSession(
  sessionId: string,
  options?: { markComplete?: boolean },
) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = sessionIdSchema.safeParse({ sessionId });
  if (!parsed.success) return { error: "Invalid session" };

  const row = await db.taskGpsSession.findFirst({
    where: {
      id: sessionId,
      userId: session.user.id,
      status: { in: ["ACTIVE", "PAUSED"] },
    },
    include: {
      task: { select: { id: true, status: true, assignedToId: true } },
    },
  });
  if (!row) return { error: "Session not found" };

  await refreshSessionProgress(sessionId);

  const updated = await db.taskGpsSession.findUnique({
    where: { id: sessionId },
    select: { coveragePct: true },
  });

  await db.taskGpsSession.update({
    where: { id: sessionId },
    data: { status: "COMPLETED", endedAt: new Date() },
  });

  const taskCoverage = await db.task.findUnique({
    where: { id: row.task.id },
    select: { coveragePct: true },
  });

  const shouldComplete =
    options?.markComplete ||
    (taskCoverage?.coveragePct != null &&
      taskCoverage.coveragePct / 100 >= GPS_AUTO_COMPLETE_COVERAGE);

  if (shouldComplete && row.task.status !== "COMPLETED") {
    await db.task.update({
      where: { id: row.task.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });
    const recipients = [
      row.task.assignedToId ?? session.user.id,
    ].filter(Boolean) as string[];
    await emitTaskEvent({
      taskId: row.task.id,
      eventType: "COMPLETED",
      recipientUserIds: recipients,
      actorUserId: session.user.id,
    });
  }

  revalidateGpsPaths(row.task.id);

  return {
    success: true,
    coveragePct: updated?.coveragePct ?? null,
    suggestedComplete: shouldComplete,
  };
}

export async function appendTaskGpsPoints(input: {
  sessionId: string;
  points: {
    lat: number;
    lng: number;
    accuracyM?: number;
    speedMps?: number;
    heading?: number;
    recordedAt: string;
  }[];
}) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = appendGpsPointsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid points" };
  }

  const row = await db.taskGpsSession.findFirst({
    where: {
      id: parsed.data.sessionId,
      userId: session.user.id,
      status: "ACTIVE",
      task: notDeletedWhere(),
    },
    include: {
      points: { orderBy: { recordedAt: "desc" }, take: 1 },
    },
  });
  if (!row) return { error: "Active session not found" };

  const lastStored = row.points[0];
  const toInsert = parsed.data.points.filter((p) => {
    if (!isGpsPointAccurate(p.accuracyM)) return false;
    if (!lastStored) return true;
    const dist = haversineM(lastStored.lat, lastStored.lng, p.lat, p.lng);
    return dist >= GPS_MIN_MOVE_M;
  });

  if (toInsert.length === 0) {
    return { success: true, accepted: 0 };
  }

  await db.taskGpsPoint.createMany({
    data: toInsert.map((p) => ({
      sessionId: parsed.data.sessionId,
      lat: p.lat,
      lng: p.lng,
      accuracyM: p.accuracyM ?? null,
      speedMps: p.speedMps ?? null,
      heading: p.heading ?? null,
      recordedAt: new Date(p.recordedAt),
    })),
  });

  await refreshSessionProgress(parsed.data.sessionId);

  const taskSession = await db.taskGpsSession.findUnique({
    where: { id: parsed.data.sessionId },
    select: { taskId: true, coveragePct: true },
  });

  return {
    success: true,
    accepted: toInsert.length,
    coveragePct: taskSession?.coveragePct ?? null,
    taskId: taskSession?.taskId,
  };
}

export async function cancelGpsSession(sessionId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const row = await db.taskGpsSession.findFirst({
    where: {
      id: sessionId,
      userId: session.user.id,
      status: { in: ["ACTIVE", "PAUSED"] },
    },
  });
  if (!row) return { error: "Session not found" };

  await db.taskGpsSession.update({
    where: { id: sessionId },
    data: { status: "CANCELLED", endedAt: new Date() },
  });

  return { success: true };
}

export async function fetchGpsFieldData(blockId: string | null) {
  const session = await auth();
  if (!session?.user) {
    return {
      activeSession: null,
      eligibleTasks: [] as Awaited<ReturnType<typeof getOpenGpsEligibleTasks>>,
    };
  }

  const [activeSession, eligibleTasks] = await Promise.all([
    getActiveGpsSessionForUser(session.user.id),
    blockId ? getOpenGpsEligibleTasks(blockId) : Promise.resolve([]),
  ]);

  return { activeSession, eligibleTasks };
}
