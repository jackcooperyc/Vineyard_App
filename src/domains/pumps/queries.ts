import { db } from "@/lib/db";

export type PumpListItem = {
  id: string;
  name: string | null;
  flowCapacity: number | null;
  servicedBlockIds: string[];
  notes: string | null;
  gpsPoint: { type: "Point"; coordinates: [number, number] };
  servicedBlocks: { id: string; code: string; name: string }[];
};

export type MapPump = {
  id: string;
  name: string | null;
  coordinates: [number, number];
};

function parseGpsPoint(
  gpsPoint: unknown,
): { type: "Point"; coordinates: [number, number] } | null {
  if (
    gpsPoint &&
    typeof gpsPoint === "object" &&
    "type" in gpsPoint &&
    gpsPoint.type === "Point" &&
    "coordinates" in gpsPoint &&
    Array.isArray(gpsPoint.coordinates) &&
    gpsPoint.coordinates.length >= 2
  ) {
    const [lng, lat] = gpsPoint.coordinates;
    if (typeof lng === "number" && typeof lat === "number") {
      return { type: "Point", coordinates: [lng, lat] };
    }
  }
  return null;
}

export async function getIrrigationPumps(): Promise<PumpListItem[]> {
  const pumps = await db.irrigationPump.findMany({
    orderBy: { name: "asc" },
  });

  const allBlockIds = [...new Set(pumps.flatMap((p) => p.servicedBlockIds))];
  const blocks =
    allBlockIds.length > 0
      ? await db.block.findMany({
          where: { id: { in: allBlockIds } },
          select: { id: true, code: true, name: true },
        })
      : [];
  const blockById = new Map(blocks.map((b) => [b.id, b]));

  return pumps
    .map((pump) => {
      const gpsPoint = parseGpsPoint(pump.gpsPoint);
      if (!gpsPoint) return null;
      return {
        id: pump.id,
        name: pump.name,
        flowCapacity: pump.flowCapacity,
        servicedBlockIds: pump.servicedBlockIds,
        notes: pump.notes,
        gpsPoint,
        servicedBlocks: pump.servicedBlockIds
          .map((id) => blockById.get(id))
          .filter((b): b is { id: string; code: string; name: string } =>
            Boolean(b),
          ),
      };
    })
    .filter((p): p is PumpListItem => p != null);
}

export async function getIrrigationPumpById(id: string) {
  const pump = await db.irrigationPump.findUnique({ where: { id } });
  if (!pump) return null;

  const gpsPoint = parseGpsPoint(pump.gpsPoint);
  if (!gpsPoint) return null;

  const servicedBlocks =
    pump.servicedBlockIds.length > 0
      ? await db.block.findMany({
          where: { id: { in: pump.servicedBlockIds } },
          select: { id: true, code: true, name: true },
        })
      : [];

  return { ...pump, gpsPoint, servicedBlocks };
}

export async function getMapPumps(): Promise<MapPump[]> {
  const pumps = await db.irrigationPump.findMany({
    select: { id: true, name: true, gpsPoint: true },
  });

  return pumps
    .map((pump) => {
      const parsed = parseGpsPoint(pump.gpsPoint);
      if (!parsed) return null;
      return {
        id: pump.id,
        name: pump.name,
        coordinates: parsed.coordinates,
      };
    })
    .filter((p): p is MapPump => p != null);
}

export async function getVineyardBlocksForPumpForm() {
  return db.block.findMany({
    where: { blockType: "VINEYARD" },
    select: { id: true, code: true, name: true },
    orderBy: { code: "asc" },
  });
}

export async function countIrrigationPumps() {
  return db.irrigationPump.count();
}

export function mapPumpsToGeoJSON(pumps: MapPump[]) {
  return {
    type: "FeatureCollection" as const,
    features: pumps.map((pump) => ({
      type: "Feature" as const,
      id: pump.id,
      geometry: {
        type: "Point" as const,
        coordinates: pump.coordinates,
      },
      properties: {
        pumpId: pump.id,
        name: pump.name ?? "Pump",
      },
    })),
  };
}
