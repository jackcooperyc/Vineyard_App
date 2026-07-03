import { db } from "@/lib/db";
import type { IrrigationStatus } from "@/generated/prisma/client";
import { frequencyToDays } from "@/domains/irrigation/constants";

export type ScheduleListItem = {
  id: string;
  frequency: string;
  startDate: Date;
  volume: number | null;
  method: string | null;
  active: boolean;
  notes: string | null;
  block: { id: string; code: string; name: string };
};

export type RecordListItem = {
  id: string;
  appliedAt: Date;
  scheduledAt: Date | null;
  volume: number | null;
  duration: number | null;
  method: string | null;
  status: IrrigationStatus;
  notes: string | null;
  block: { id: string; code: string; name: string };
};

export type IrrigationAlert = {
  scheduleId: string;
  block: { id: string; code: string; name: string };
  frequency: string;
  lastAppliedAt: Date | null;
  daysSinceLast: number | null;
  expectedDays: number;
};

export type IrrigationView = "schedules" | "records" | "alerts";

export type IrrigationHubStats = {
  activeSchedules: number;
  overdueAlerts: number;
  recordsThisWeek: number;
  totalVolumeThisWeek: number | null;
};

export type ScheduleWithDueHint = ScheduleListItem & {
  lastAppliedAt: Date | null;
  daysSinceLast: number | null;
  isOverdue: boolean;
};

export type IrrigationRecordRange = "week" | "month";

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfWeek() {
  const d = startOfToday();
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d;
}

function startOfMonth() {
  const d = startOfToday();
  d.setDate(1);
  return d;
}

function recordRangeStart(range?: IrrigationRecordRange) {
  if (range === "month") return startOfMonth();
  if (range === "week") return startOfWeek();
  return undefined;
}

export async function getIrrigationHubStats(
  blockId?: string,
): Promise<IrrigationHubStats> {
  const weekStart = startOfWeek();
  const blockWhere = blockId ? { blockId } : {};

  const [activeSchedules, alerts, recordsThisWeek, volumeAgg] = await Promise.all([
    db.irrigationSchedule.count({
      where: { ...blockWhere, active: true },
    }),
    getIrrigationAlerts(),
    db.irrigationRecord.count({
      where: {
        ...blockWhere,
        appliedAt: { gte: weekStart },
      },
    }),
    db.irrigationRecord.aggregate({
      where: {
        ...blockWhere,
        appliedAt: { gte: weekStart },
        volume: { not: null },
      },
      _sum: { volume: true },
    }),
  ]);

  const overdueAlerts = blockId
    ? alerts.filter((alert) => alert.block.id === blockId).length
    : alerts.length;

  return {
    activeSchedules,
    overdueAlerts,
    recordsThisWeek,
    totalVolumeThisWeek: volumeAgg._sum.volume,
  };
}

export async function getSchedulesWithDueHints(filters?: {
  blockId?: string;
  activeOnly?: boolean;
  inactiveOnly?: boolean;
  search?: string;
}): Promise<ScheduleWithDueHint[]> {
  const search = filters?.search?.trim();
  const schedules = await db.irrigationSchedule.findMany({
    where: {
      ...(filters?.blockId ? { blockId: filters.blockId } : {}),
      ...(filters?.activeOnly ? { active: true } : {}),
      ...(filters?.inactiveOnly ? { active: false } : {}),
      ...(search
        ? {
            OR: [
              { notes: { contains: search, mode: "insensitive" } },
              { method: { contains: search, mode: "insensitive" } },
              { block: { name: { contains: search, mode: "insensitive" } } },
              { block: { code: { contains: search, mode: "insensitive" } } },
            ],
          }
        : {}),
    },
    include: {
      block: { select: { id: true, code: true, name: true } },
    },
    orderBy: [{ active: "desc" }, { startDate: "desc" }],
  });

  if (schedules.length === 0) return [];

  const blockIds = [...new Set(schedules.map((schedule) => schedule.blockId))];
  const lastAppliedRows = await db.irrigationRecord.groupBy({
    by: ["blockId"],
    where: {
      blockId: { in: blockIds },
      status: "APPLIED",
    },
    _max: { appliedAt: true },
  });

  const lastAppliedByBlock = new Map(
    lastAppliedRows.map((row) => [row.blockId, row._max.appliedAt]),
  );

  const now = new Date();

  return schedules.map((schedule) => {
    const expectedDays = frequencyToDays(schedule.frequency);
    const lastAppliedAt = lastAppliedByBlock.get(schedule.blockId) ?? null;
    const daysSinceLast = lastAppliedAt
      ? Math.floor(
          (now.getTime() - lastAppliedAt.getTime()) / (1000 * 60 * 60 * 24),
        )
      : null;

    const isOverdue =
      schedule.active &&
      (daysSinceLast === null
        ? now.getTime() - schedule.startDate.getTime() > expectedDays * 86400000
        : daysSinceLast > expectedDays);

    return {
      ...schedule,
      lastAppliedAt,
      daysSinceLast,
      isOverdue,
    };
  });
}

export async function getScheduleDueHintById(
  scheduleId: string,
): Promise<ScheduleWithDueHint | null> {
  const schedules = await getSchedulesWithDueHints();
  return schedules.find((s) => s.id === scheduleId) ?? null;
}

export async function getPumpsForBlock(blockId: string) {
  return db.irrigationPump.findMany({
    where: { servicedBlockIds: { has: blockId } },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });
}

export async function getIrrigationSchedules(filters?: {
  blockId?: string;
  activeOnly?: boolean;
  inactiveOnly?: boolean;
}) {
  return db.irrigationSchedule.findMany({
    where: {
      ...(filters?.blockId ? { blockId: filters.blockId } : {}),
      ...(filters?.activeOnly ? { active: true } : {}),
      ...(filters?.inactiveOnly ? { active: false } : {}),
    },
    include: {
      block: { select: { id: true, code: true, name: true } },
    },
    orderBy: [{ active: "desc" }, { startDate: "desc" }],
  });
}

export async function getIrrigationScheduleById(id: string) {
  return db.irrigationSchedule.findUnique({
    where: { id },
    include: {
      block: {
        select: {
          id: true,
          code: true,
          name: true,
          vineyard: { select: { name: true } },
        },
      },
    },
  });
}

export async function getIrrigationRecords(filters?: {
  blockId?: string;
  status?: IrrigationStatus;
  range?: IrrigationRecordRange;
}) {
  const rangeStart = recordRangeStart(filters?.range);

  return db.irrigationRecord.findMany({
    where: {
      ...(filters?.blockId ? { blockId: filters.blockId } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
      ...(rangeStart ? { appliedAt: { gte: rangeStart } } : {}),
    },
    include: {
      block: { select: { id: true, code: true, name: true } },
    },
    orderBy: { appliedAt: "desc" },
  });
}

export async function getIrrigationRecordById(id: string) {
  return db.irrigationRecord.findUnique({
    where: { id },
    include: {
      block: {
        select: {
          id: true,
          code: true,
          name: true,
          vineyard: { select: { name: true } },
        },
      },
    },
  });
}

export async function getIrrigationAlerts(): Promise<IrrigationAlert[]> {
  const schedules = await db.irrigationSchedule.findMany({
    where: { active: true },
    include: { block: { select: { id: true, code: true, name: true } } },
  });

  const alerts: IrrigationAlert[] = [];
  const now = new Date();

  for (const schedule of schedules) {
    const expectedDays = frequencyToDays(schedule.frequency);
    const lastApplied = await db.irrigationRecord.findFirst({
      where: { blockId: schedule.blockId, status: "APPLIED" },
      orderBy: { appliedAt: "desc" },
      select: { appliedAt: true },
    });

    const daysSinceLast = lastApplied
      ? Math.floor(
          (now.getTime() - lastApplied.appliedAt.getTime()) /
            (1000 * 60 * 60 * 24),
        )
      : null;

    const isOverdue =
      daysSinceLast === null
        ? now.getTime() - schedule.startDate.getTime() > expectedDays * 86400000
        : daysSinceLast > expectedDays;

    if (isOverdue) {
      alerts.push({
        scheduleId: schedule.id,
        block: schedule.block,
        frequency: schedule.frequency,
        lastAppliedAt: lastApplied?.appliedAt ?? null,
        daysSinceLast,
        expectedDays,
      });
    }
  }

  return alerts.sort((a, b) => (b.daysSinceLast ?? 999) - (a.daysSinceLast ?? 999));
}

export async function countIrrigationAlerts() {
  const alerts = await getIrrigationAlerts();
  return alerts.length;
}

export async function getRecentIrrigationByBlock(blockId: string, limit = 5) {
  return db.irrigationRecord.findMany({
    where: { blockId },
    orderBy: { appliedAt: "desc" },
    take: limit,
  });
}

export async function getBlocksForIrrigationForm() {
  return db.block.findMany({
    where: { blockType: "VINEYARD" },
    select: { id: true, code: true, name: true },
    orderBy: { code: "asc" },
  });
}
