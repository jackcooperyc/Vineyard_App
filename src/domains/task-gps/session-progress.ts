import { db } from "@/lib/db";
import {
  GPS_DEFAULT_SWATH_M,
} from "@/domains/task-gps/constants";
import { computeCoveragePercent } from "@/domains/task-gps/coverage";
import { countVisitedRows } from "@/domains/task-gps/row-matcher";
import { updateTaskBlockProgress } from "@/domains/tasks/task-blocks";
import { createGpsSessionForTask } from "@/domains/task-gps/start-session-core";

export function haversineM(
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

export async function refreshSessionProgress(sessionId: string) {
  const session = await db.taskGpsSession.findUnique({
    where: { id: sessionId },
    include: {
      points: { orderBy: { recordedAt: "asc" } },
      block: { include: { mapFeature: true, blockRows: true } },
      task: { select: { id: true, blockId: true } },
    },
  });
  if (!session) return;

  const blockId = session.blockId ?? session.task.blockId;
  const block =
    session.block ??
    (await db.block.findUnique({
      where: { id: blockId },
      include: { mapFeature: true, blockRows: true },
    }));
  if (!block?.mapFeature) return;

  const coords = session.points.map((p) => ({ lat: p.lat, lng: p.lng }));
  const swath = session.swathWidthM ?? GPS_DEFAULT_SWATH_M;
  const coveragePct =
    computeCoveragePercent(coords, block.mapFeature.geometry, swath) ??
    session.coveragePct;

  const rowGeoms = block.blockRows.map((r) => ({
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
      blockId,
    },
  });

  await updateTaskBlockProgress(session.taskId, blockId, {
    coveragePct,
    rowsCompleted: total > 0 ? visited : null,
    rowsTotal: total > 0 ? total : null,
  });

  const last = session.points[session.points.length - 1];
  if (last) {
    await db.task.update({
      where: { id: session.taskId },
      data: { lastKnownLat: last.lat, lastKnownLng: last.lng },
    });
  }
}

export { createGpsSessionForTask };
