import { db } from "@/lib/db";
import { getIrrigationAlerts } from "@/domains/irrigation/queries";
import { notDeletedWhere } from "@/lib/soft-delete";
import type {
  MapBlock,
  MapBlockFeatureCollection,
  MapBlockOverlay,
} from "@/domains/map/types";

function resolveOverlay(
  openTasks: number,
  irrigationOverdue: boolean,
): MapBlockOverlay {
  if (irrigationOverdue) return "irrigation";
  if (openTasks > 0) return "tasks";
  return "default";
}

export async function getMapBlocks(): Promise<MapBlock[]> {
  const [features, openTaskCounts, openTasksWithEquipment, alerts] = await Promise.all([
    db.mapFeature.findMany({
      include: {
        block: {
          include: {
            plantings: {
              include: { variety: true },
              orderBy: { vineCount: "desc" },
              take: 1,
            },
          },
        },
      },
    }),
    db.task.groupBy({
      by: ["blockId"],
      where: {
        ...notDeletedWhere(),
        status: { in: ["PENDING", "IN_PROGRESS"] },
      },
      _count: { _all: true },
    }),
    db.task.findMany({
      where: {
        ...notDeletedWhere(),
        status: { in: ["PENDING", "IN_PROGRESS"] },
        equipmentId: { not: null },
      },
      select: {
        blockId: true,
        equipment: { select: { id: true, name: true, type: true } },
      },
    }),
    getIrrigationAlerts(),
  ]);

  const equipmentByBlock = new Map<
    string,
    { id: string; name: string; type: string }[]
  >();
  for (const task of openTasksWithEquipment) {
    if (!task.equipment) continue;
    const list = equipmentByBlock.get(task.blockId) ?? [];
    if (!list.some((eq) => eq.id === task.equipment!.id)) {
      list.push(task.equipment);
      equipmentByBlock.set(task.blockId, list);
    }
  }

  const taskCountByBlock = new Map(
    openTaskCounts.map((row) => [row.blockId, row._count._all]),
  );
  const alertBlockIds = new Set(alerts.map((alert) => alert.block.id));

  return features
    .map((feature) => {
      const block = feature.block;
      const openTasks = taskCountByBlock.get(block.id) ?? 0;
      const irrigationOverdue = alertBlockIds.has(block.id);
      const totalVines = block.plantings.reduce(
        (sum, p) => sum + (p.vineCount ?? 0),
        0,
      );

      const primaryPlanting = block.plantings[0];

      return {
        id: block.id,
        code: block.code,
        name: block.name,
        status: block.status,
        blockType: block.blockType,
        infrastructureType: block.infrastructureType,
        primaryVariety: primaryPlanting?.variety.name ?? null,
        primaryVarietyId: primaryPlanting?.variety.id ?? null,
        varietyColorHex: primaryPlanting?.variety.colorHex ?? null,
        totalVines,
        acreage: block.acreage,
        elevMin: block.elevMin,
        elevMed: block.elevMed,
        elevMax: block.elevMax,
        colorHex: block.colorHex,
        centerLat: feature.centerLat,
        centerLng: feature.centerLng,
        geometry: feature.geometry as MapBlock["geometry"],
        openTasks,
        irrigationOverdue,
        overlay: resolveOverlay(openTasks, irrigationOverdue),
        openTaskEquipment: equipmentByBlock.get(block.id) ?? [],
      };
    })
    .sort((a, b) => a.code.localeCompare(b.code));
}

export function mapBlocksToGeoJSON(
  blocks: MapBlock[],
): MapBlockFeatureCollection {
  return {
    type: "FeatureCollection",
    features: blocks.map((block) => ({
      type: "Feature",
      id: block.id,
      geometry: block.geometry,
      properties: {
        blockId: block.id,
        code: block.code,
        name: block.name,
        overlay: block.overlay,
        blockType: block.blockType,
        openTasks: block.openTasks,
        irrigationOverdue: block.irrigationOverdue,
        elevMed: block.elevMed,
        colorHex: block.colorHex,
        varietyColorHex: block.varietyColorHex,
        varietyName: block.primaryVariety,
      },
    })),
  };
}

export function getMapBounds(
  blocks: MapBlock[],
): [[number, number], [number, number]] | null {
  if (blocks.length === 0) return null;

  let minLng = Infinity;
  let minLat = Infinity;
  let maxLng = -Infinity;
  let maxLat = -Infinity;

  for (const block of blocks) {
    for (const [lng, lat] of block.geometry.coordinates[0]) {
      minLng = Math.min(minLng, lng);
      minLat = Math.min(minLat, lat);
      maxLng = Math.max(maxLng, lng);
      maxLat = Math.max(maxLat, lat);
    }
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ];
}
