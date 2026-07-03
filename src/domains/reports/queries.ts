import { db } from "@/lib/db";

export type TaskReportRow = {
  blockId: string;
  blockCode: string;
  blockName: string;
  completedCount: number;
};

export type IrrigationReportRow = {
  blockId: string;
  blockCode: string;
  blockName: string;
  recordCount: number;
  totalVolumeGal: number | null;
};

const REPORT_DAYS = 30;

function daysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  d.setHours(0, 0, 0, 0);
  return d;
}

export async function getTasksCompletedByBlockReport(): Promise<TaskReportRow[]> {
  const since = daysAgo(REPORT_DAYS);

  const rows = await db.task.groupBy({
    by: ["blockId"],
    where: {
      status: "COMPLETED",
      completedAt: { gte: since },
    },
    _count: { _all: true },
  });

  if (rows.length === 0) return [];

  const blocks = await db.block.findMany({
    where: { id: { in: rows.map((r) => r.blockId) } },
    select: { id: true, code: true, name: true },
  });
  const blockById = new Map(blocks.map((b) => [b.id, b]));

  return rows
    .map((row) => {
      const block = blockById.get(row.blockId);
      if (!block) return null;
      return {
        blockId: block.id,
        blockCode: block.code,
        blockName: block.name,
        completedCount: row._count._all,
      };
    })
    .filter((r): r is TaskReportRow => r != null)
    .sort((a, b) => a.blockCode.localeCompare(b.blockCode, undefined, { numeric: true }));
}

export async function getIrrigationVolumeByBlockReport(): Promise<IrrigationReportRow[]> {
  const since = daysAgo(REPORT_DAYS);

  const records = await db.irrigationRecord.findMany({
    where: {
      appliedAt: { gte: since },
      status: "APPLIED",
    },
    select: {
      blockId: true,
      volume: true,
      block: { select: { code: true, name: true } },
    },
  });

  const byBlock = new Map<
    string,
    { code: string; name: string; count: number; volume: number }
  >();

  for (const record of records) {
    const existing = byBlock.get(record.blockId) ?? {
      code: record.block.code,
      name: record.block.name,
      count: 0,
      volume: 0,
    };
    existing.count += 1;
    if (record.volume != null) {
      existing.volume += record.volume;
    }
    byBlock.set(record.blockId, existing);
  }

  return [...byBlock.entries()]
    .map(([blockId, data]) => ({
      blockId,
      blockCode: data.code,
      blockName: data.name,
      recordCount: data.count,
      totalVolumeGal: data.volume > 0 ? data.volume : null,
    }))
    .sort((a, b) => a.blockCode.localeCompare(b.blockCode, undefined, { numeric: true }));
}

export const REPORT_PERIOD_DAYS = REPORT_DAYS;

export type EquipmentMaintenanceReportRow = {
  equipmentId: string;
  equipmentName: string;
  equipmentType: string;
  recordCount: number;
  lastPerformedAt: Date | null;
};

export type OverdueIrrigationReportRow = {
  blockId: string;
  blockCode: string;
  blockName: string;
  daysOverdue: number;
  frequency: string;
};

export type OpenTasksByTypeReportRow = {
  type: string;
  openCount: number;
};

export async function getEquipmentMaintenanceReport(): Promise<
  EquipmentMaintenanceReportRow[]
> {
  const since = daysAgo(REPORT_DAYS);

  const rows = await db.maintenanceRecord.groupBy({
    by: ["equipmentId"],
    where: { performedAt: { gte: since } },
    _count: { _all: true },
    _max: { performedAt: true },
  });

  if (rows.length === 0) return [];

  const equipment = await db.equipment.findMany({
    where: { id: { in: rows.map((r) => r.equipmentId) } },
    select: { id: true, name: true, type: true },
  });
  const equipmentById = new Map(equipment.map((e) => [e.id, e]));

  return rows
    .map((row) => {
      const eq = equipmentById.get(row.equipmentId);
      if (!eq) return null;
      return {
        equipmentId: eq.id,
        equipmentName: eq.name,
        equipmentType: eq.type,
        recordCount: row._count._all,
        lastPerformedAt: row._max.performedAt,
      };
    })
    .filter((r): r is EquipmentMaintenanceReportRow => r != null)
    .sort((a, b) => a.equipmentName.localeCompare(b.equipmentName));
}

export async function getOverdueIrrigationReport(): Promise<
  OverdueIrrigationReportRow[]
> {
  const { getIrrigationAlerts } = await import("@/domains/irrigation/queries");
  const alerts = await getIrrigationAlerts();

  return alerts
    .map((alert) => {
      const daysOverdue =
        alert.daysSinceLast != null
          ? Math.max(0, alert.daysSinceLast - alert.expectedDays)
          : 0;
      return {
        blockId: alert.block.id,
        blockCode: alert.block.code,
        blockName: alert.block.name,
        daysOverdue,
        frequency: alert.frequency,
      };
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue);
}

export async function getOpenTasksByTypeReport(): Promise<
  OpenTasksByTypeReportRow[]
> {
  const tasks = await db.task.findMany({
    where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
    select: { taskType: { select: { label: true } } },
  });

  const counts = new Map<string, number>();
  for (const task of tasks) {
    const label = task.taskType.label;
    counts.set(label, (counts.get(label) ?? 0) + 1);
  }

  return [...counts.entries()]
    .map(([type, openCount]) => ({ type, openCount }))
    .sort((a, b) => b.openCount - a.openCount);
}
