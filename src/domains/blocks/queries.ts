import { db } from "@/lib/db";
import type { BlockStatus } from "@/generated/prisma/client";
import { countIrrigationAlerts } from "@/domains/irrigation/queries";

export type BlockListItem = {
  id: string;
  code: string;
  name: string;
  acreage: number | null;
  status: BlockStatus;
  primaryVariety: string | null;
  totalVines: number;
  yearPlanted: number | null;
};

export async function getBlocks(): Promise<BlockListItem[]> {
  const blocks = await db.block.findMany({
    include: {
      plantings: {
        include: { variety: true },
        orderBy: { vineCount: "desc" },
      },
    },
    orderBy: { code: "asc" },
  });

  return blocks.map((block) => {
    const primary = block.plantings[0];
    return {
      id: block.id,
      code: block.code,
      name: block.name,
      acreage: block.acreage,
      status: block.status,
      primaryVariety: primary?.variety.name ?? null,
      totalVines: block.plantings.reduce((sum, p) => sum + p.vineCount, 0),
      yearPlanted: primary?.yearPlanted ?? null,
    };
  });
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
        include: {
          assignedTo: { select: { name: true } },
        },
      },
      mapFeature: true,
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
  const [blockCount, pendingTasks, upcomingIrrigation, equipmentNeedingService, irrigationAlerts] =
    await Promise.all([
    db.block.count(),
    db.task.count({
      where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
    }),
    db.irrigationSchedule.count({
      where: { active: true },
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
