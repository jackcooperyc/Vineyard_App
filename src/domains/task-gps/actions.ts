"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { notDeletedWhere } from "@/lib/soft-delete";
import {
  GPS_AUTO_COMPLETE_COVERAGE,
  GPS_DEFAULT_SWATH_M,
  GPS_MIN_MOVE_M,
} from "@/domains/task-gps/constants";
import { computeCoveragePercent } from "@/domains/task-gps/coverage";
import { countVisitedRows } from "@/domains/task-gps/row-matcher";
import {
  appendGpsPointsSchema,
  isGpsPointAccurate,
  sessionIdSchema,
  startGpsSessionSchema,
} from "@/domains/task-gps/validators";
import { emitTaskEvent } from "@/domains/notifications/delivery";
import {
  getActiveGpsSessionForUser,
  getOpenGpsEligibleTasks,
} from "@/domains/task-gps/queries";

function haversineM(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

async function refreshSessionProgress(sessionId: string) {
  const session = await db.taskGpsSession.findUnique({
    where: { id: sessionId },
    include: {
      points: { orderBy: { recordedAt: "asc" } },
      task: {
        include: {
          block: { include: { mapFeature: true, blockRows: true } },
        },
      },
    },
  });
  if (!session?.task.block.mapFeature) return;

  const coords = session.points.map((p) => ({ lat: p.lat, lng: p.lng }));
  const swath = session.swathWidthM ?? GPS_DEFAULT_SWATH_M;
  const coveragePct =
    computeCoveragePercent(coords, session.task.block.mapFeature.geometry, swath) ??
    session.coveragePct;

  const rowGeoms = session.task.block.blockRows.map((r) => ({
    rowIndex: r.rowIndex,
    geometry: r.geometry,
    lengthM: r.lengthM,
  }));
  const { visited, total } = countVisitedRows(coords, rowGeoms);

  await db.taskGpsSession.update({
    where: { id: sessionId },
    data: {
      coveragePct,
      rowsVisited: total > 0 ? visited : null,
      pointCount: session.points.length,
    },
  });

  const last = session.points[session.points.length - 1];
  await db.task.update({
    where: { id: session.taskId },
    data: {
      coveragePct,
      rowsCompleted: total > 0 ? visited : null,
      rowsTotal: total > 0 ? total : null,
      ...(last
        ? { lastKnownLat: last.lat, lastKnownLng: last.lng }
        : {}),
    },
  });
}

export async function startGpsSession(input: {
  taskId: string;
  swathWidthM?: number;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = startGpsSessionSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await db.taskGpsSession.findFirst({
    where: {
      userId: session.user.id,
      status: { in: ["ACTIVE", "PAUSED"] },
    },
  });
  if (existing) {
    return { error: "You already have an active GPS session. End it first." };
  }

  const task = await db.task.findFirst({
    where: {
      id: parsed.data.taskId,
      ...notDeletedWhere(),
      taskType: { tracksGpsProgress: true, active: true },
    },
    include: {
      taskType: { select: { defaultSwathWidthM: true } },
    },
  });
  if (!task) return { error: "Task not found or not GPS-eligible" };

  const swathWidthM =
    parsed.data.swathWidthM ??
    task.taskType.defaultSwathWidthM ??
    GPS_DEFAULT_SWATH_M;

  const gpsSession = await db.taskGpsSession.create({
    data: {
      taskId: task.id,
      userId: session.user.id,
      swathWidthM,
      status: "ACTIVE",
    },
  });

  if (task.status === "PENDING") {
    await db.task.update({
      where: { id: task.id },
      data: { status: "IN_PROGRESS" },
    });
    const recipients = [
      task.assignedToId ?? session.user.id,
    ].filter(Boolean) as string[];
    await emitTaskEvent({
      taskId: task.id,
      eventType: "IN_PROGRESS",
      recipientUserIds: recipients,
      actorUserId: session.user.id,
    });
  }

  revalidatePath("/field");
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${task.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/map");

  return { success: true, sessionId: gpsSession.id };
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

  const shouldComplete =
    options?.markComplete ||
    (updated?.coveragePct != null &&
      updated.coveragePct / 100 >= GPS_AUTO_COMPLETE_COVERAGE);

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

  revalidatePath("/field");
  revalidatePath("/tasks");
  revalidatePath(`/tasks/${row.task.id}`);
  revalidatePath("/dashboard");
  revalidatePath("/map");

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

export async function fetchGpsFieldData(blockId: string) {
  const session = await auth();
  if (!session?.user) {
    return {
      activeSession: null,
      eligibleTasks: [] as Awaited<ReturnType<typeof getOpenGpsEligibleTasks>>,
    };
  }

  const [activeSession, eligibleTasks] = await Promise.all([
    getActiveGpsSessionForUser(session.user.id),
    getOpenGpsEligibleTasks(blockId),
  ]);

  return { activeSession, eligibleTasks };
}
