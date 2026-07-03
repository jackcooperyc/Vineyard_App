import { db } from "@/lib/db";
import { notDeletedWhere } from "@/lib/soft-delete";

const taskBlockSelect = {
  orderBy: { sortOrder: "asc" as const },
  include: {
    block: { select: { id: true, code: true, name: true } },
  },
};

export async function getTaskGpsSessions(taskId: string) {
  return db.taskGpsSession.findMany({
    where: { taskId },
    include: {
      user: { select: { id: true, name: true, email: true } },
      block: { select: { id: true, code: true, name: true } },
    },
    orderBy: { startedAt: "desc" },
  });
}

export async function getActiveGpsSessionForUser(userId: string) {
  return db.taskGpsSession.findFirst({
    where: { userId, status: { in: ["ACTIVE", "PAUSED"] } },
    include: {
      block: { select: { id: true, code: true, name: true } },
      task: {
        select: {
          id: true,
          title: true,
          blockId: true,
          coveragePct: true,
          taskType: { select: { label: true, tracksGpsProgress: true } },
          block: { select: { code: true, name: true } },
          taskBlocks: taskBlockSelect,
        },
      },
    },
  });
}

export async function getActiveFieldSessions(limit = 10) {
  return db.taskGpsSession.findMany({
    where: {
      status: "ACTIVE",
      task: notDeletedWhere(),
    },
    include: {
      user: { select: { name: true } },
      block: { select: { code: true, name: true } },
      task: {
        select: {
          id: true,
          title: true,
          coveragePct: true,
          block: { select: { code: true, name: true } },
          taskType: { select: { label: true } },
          taskBlocks: taskBlockSelect,
        },
      },
    },
    orderBy: { startedAt: "desc" },
    take: limit,
  });
}

export async function getSessionTrackGeoJson(sessionId: string) {
  const points = await db.taskGpsPoint.findMany({
    where: { sessionId },
    orderBy: { recordedAt: "asc" },
    select: { lat: true, lng: true, recordedAt: true },
  });

  if (points.length === 0) return null;

  return {
    type: "Feature" as const,
    geometry: {
      type: "LineString" as const,
      coordinates: points.map((p) => [p.lng, p.lat]),
    },
    properties: {
      sessionId,
      pointCount: points.length,
    },
  };
}

export type GpsTrackFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: "LineString"; coordinates: [number, number][] };
    properties: {
      sessionId: string;
      taskId: string;
      blockId: string;
      title: string;
      coveragePct: number | null;
    };
  }>;
};

export async function getActiveGpsTracksGeoJson(): Promise<GpsTrackFeatureCollection> {
  const sessions = await db.taskGpsSession.findMany({
    where: {
      status: { in: ["ACTIVE", "PAUSED"] },
      task: notDeletedWhere(),
    },
    select: {
      id: true,
      taskId: true,
      blockId: true,
      coveragePct: true,
      task: { select: { blockId: true, title: true } },
    },
  });

  if (sessions.length === 0) {
    return { type: "FeatureCollection", features: [] };
  }

  const sessionIds = sessions.map((s) => s.id);
  const allPoints = await db.taskGpsPoint.findMany({
    where: { sessionId: { in: sessionIds } },
    orderBy: { recordedAt: "asc" },
    select: { sessionId: true, lat: true, lng: true },
  });

  const pointsBySession = new Map<string, { lat: number; lng: number }[]>();
  for (const point of allPoints) {
    const list = pointsBySession.get(point.sessionId) ?? [];
    list.push({ lat: point.lat, lng: point.lng });
    pointsBySession.set(point.sessionId, list);
  }

  const features: GpsTrackFeatureCollection["features"] = [];
  for (const session of sessions) {
    const points = pointsBySession.get(session.id);
    if (!points || points.length < 2) continue;
    features.push({
      type: "Feature",
      geometry: {
        type: "LineString",
        coordinates: points.map((p) => [p.lng, p.lat]),
      },
      properties: {
        sessionId: session.id,
        taskId: session.taskId,
        blockId: session.blockId ?? session.task.blockId,
        title: session.task.title,
        coveragePct: session.coveragePct,
      },
    });
  }

  return { type: "FeatureCollection", features };
}

const eligibleTaskInclude = {
  block: { select: { code: true } },
  taskType: {
    select: {
      label: true,
      defaultSwathWidthM: true,
      tracksGpsProgress: true,
    },
  },
  taskBlocks: taskBlockSelect,
} as const;

export async function getOpenGpsEligibleTasksForBlocks(blockIds: string[]) {
  const unique = [...new Set(blockIds)];
  if (unique.length === 0) return [];

  return db.task.findMany({
    where: {
      ...notDeletedWhere(),
      status: { in: ["PENDING", "IN_PROGRESS"] },
      taskType: { tracksGpsProgress: true, active: true },
      OR: unique.flatMap((blockId) => [
        { blockId },
        { taskBlocks: { some: { blockId } } },
      ]),
    },
    include: eligibleTaskInclude,
    orderBy: { dueDate: "asc" },
  });
}

export async function getOpenGpsEligibleTasks(blockId: string) {
  return getOpenGpsEligibleTasksForBlocks([blockId]);
}
