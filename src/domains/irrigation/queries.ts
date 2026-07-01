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

export async function getIrrigationSchedules(activeOnly = false) {
  return db.irrigationSchedule.findMany({
    where: activeOnly ? { active: true } : undefined,
    include: {
      block: { select: { id: true, code: true, name: true } },
    },
    orderBy: [{ active: "desc" }, { startDate: "desc" }],
  });
}

export async function getIrrigationRecords(filters?: {
  blockId?: string;
  status?: IrrigationStatus;
}) {
  return db.irrigationRecord.findMany({
    where: {
      ...(filters?.blockId ? { blockId: filters.blockId } : {}),
      ...(filters?.status ? { status: filters.status } : {}),
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
    select: { id: true, code: true, name: true },
    orderBy: { code: "asc" },
  });
}
