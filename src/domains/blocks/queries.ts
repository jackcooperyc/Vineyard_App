import { db } from "@/lib/db";
import type { BlockStatus, BlockType } from "@/generated/prisma/client";
import { countIrrigationAlerts } from "@/domains/irrigation/queries";
import { notDeletedWhere } from "@/lib/soft-delete";

export type BlockListItem = {
  id: string;
  code: string;
  name: string;
  acreage: number | null;
  status: BlockStatus;
  blockType: BlockType;
  infrastructureType: string | null;
  primaryVariety: string | null;
  varieties: string[];
  totalVines: number;
  yearPlanted: number | null;
};

function compareBlockCodes(a: BlockListItem, b: BlockListItem): number {
  if (a.blockType !== b.blockType) {
    return a.blockType === "VINEYARD" ? -1 : 1;
  }
  const aNum = Number.parseInt(a.code, 10);
  const bNum = Number.parseInt(b.code, 10);
  if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
  return a.code.localeCompare(b.code);
}

export async function getBlocks(filters?: {
  blockType?: BlockType;
}): Promise<BlockListItem[]> {
  const blocks = await db.block.findMany({
    where: filters?.blockType ? { blockType: filters.blockType } : undefined,
    include: {
      plantings: {
        include: { variety: true },
        orderBy: { vineCount: "desc" },
      },
    },
  });

  return blocks
    .map((block) => {
      const primary = block.plantings[0];
      const varieties = [
        ...new Set(block.plantings.map((p) => p.variety.name)),
      ].sort((a, b) => a.localeCompare(b));

      return {
        id: block.id,
        code: block.code,
        name: block.name,
        acreage: block.acreage,
        status: block.status,
        blockType: block.blockType,
        infrastructureType: block.infrastructureType,
        primaryVariety: primary?.variety.name ?? null,
        varieties,
        totalVines: block.plantings.reduce(
          (sum, p) => sum + (p.vineCount ?? 0),
          0,
        ),
        yearPlanted: primary?.yearPlanted ?? null,
      };
    })
    .sort(compareBlockCodes);
}

export async function getVineyardBlocksForField() {
  const blocks = await getBlocks({ blockType: "VINEYARD" });
  return blocks.map((b) => ({ id: b.id, code: b.code, name: b.name }));
}

export async function getBlockById(id: string) {
  return db.block.findUnique({
    where: { id },
    include: {
      vineyard: true,
      plantings: {
        include: { variety: true },
        orderBy: { yearPlanted: "asc" },
      },
      notes_records: {
        include: { author: { select: { name: true, email: true } } },
        orderBy: { createdAt: "desc" },
      },
      tasks: {
        orderBy: { dueDate: "asc" },
        take: 5,
        select: {
          id: true,
          title: true,
          status: true,
          dueDate: true,
          completedAt: true,
          coveragePct: true,
          rowsCompleted: true,
          rowsTotal: true,
          assignedTo: { select: { name: true } },
          taskType: {
            select: {
              id: true,
              slug: true,
              label: true,
              iconName: true,
              colorHex: true,
              tracksGpsProgress: true,
            },
          },
        },
      },
      mapFeature: true,
      viticultureMetrics: true,
      irrigationRecords: {
        orderBy: { appliedAt: "desc" },
        take: 5,
      },
      irrigationSchedules: {
        where: { active: true },
        take: 3,
      },
      _count: {
        select: {
          tasks: true,
          irrigationRecords: true,
        },
      },
    },
  });
}

export async function getDashboardStats() {
  const [
    blockCount,
    vineyardBlockCount,
    pendingTasks,
    upcomingIrrigation,
    equipmentNeedingService,
    irrigationAlerts,
  ] = await Promise.all([
    db.block.count(),
    db.block.count({ where: { blockType: "VINEYARD" } }),
    db.task.count({
      where: { ...notDeletedWhere(), status: { in: ["PENDING", "IN_PROGRESS"] } },
    }),
    db.irrigationSchedule.count({
      where: { ...notDeletedWhere(), active: true },
    }),
    db.equipment.count({
      where: {
        status: { not: "RETIRED" },
        nextServiceAt: { lte: new Date() },
      },
    }),
    countIrrigationAlerts(),
  ]);

  return {
    blockCount,
    vineyardBlockCount,
    pendingTasks,
    upcomingIrrigation,
    equipmentNeedingService,
    irrigationAlerts,
  };
}

export async function getVineyardName() {
  const vineyard = await db.vineyard.findFirst({
    select: { name: true },
  });
  return vineyard?.name ?? "Cooper Estate Vineyards";
}

export async function getOpenTaskEquipmentForBlock(blockId: string) {
  const tasks = await db.task.findMany({
    where: {
      ...notDeletedWhere(),
      blockId,
      status: { in: ["PENDING", "IN_PROGRESS"] },
      equipmentId: { not: null },
    },
    select: {
      equipment: {
        select: { id: true, name: true, type: true, status: true },
      },
    },
  });

  const seen = new Set<string>();
  const equipment: { id: string; name: string; type: string; status: string }[] =
    [];

  for (const task of tasks) {
    const eq = task.equipment;
    if (!eq || seen.has(eq.id)) continue;
    seen.add(eq.id);
    equipment.push(eq);
  }

  return equipment;
}
