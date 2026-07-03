import { db } from "@/lib/db";
import { deletedWithinRetentionWhere } from "@/lib/soft-delete";
import { purgeExpiredSoftDeletes } from "@/lib/soft-delete-purge";

export type RecentlyDeletedTask = {
  id: string;
  title: string;
  deletedAt: Date;
  block: { id: string; code: string; name: string };
  taskType: { label: string };
};

export type RecentlyDeletedIrrigationRecord = {
  id: string;
  appliedAt: Date;
  deletedAt: Date;
  method: string | null;
  volume: number | null;
  block: { id: string; code: string; name: string };
};

export type RecentlyDeletedIrrigationSchedule = {
  id: string;
  frequency: string;
  deletedAt: Date;
  block: { id: string; code: string; name: string };
};

export type RecentlyDeletedMaintenanceRecord = {
  id: string;
  performedAt: Date;
  description: string | null;
  deletedAt: Date;
  equipment: { id: string; name: string };
};

export type RecentlyDeletedEquipment = {
  id: string;
  name: string;
  type: string;
  status: "ACTIVE" | "IN_MAINTENANCE" | "RETIRED";
  deletedAt: Date;
};

async function ensurePurge() {
  await purgeExpiredSoftDeletes();
}

export async function getRecentlyDeletedTasks(
  blockId?: string,
): Promise<RecentlyDeletedTask[]> {
  await ensurePurge();

  return db.task.findMany({
    where: {
      ...deletedWithinRetentionWhere(),
      ...(blockId ? { blockId } : {}),
    },
    select: {
      id: true,
      title: true,
      deletedAt: true,
      block: { select: { id: true, code: true, name: true } },
      taskType: { select: { label: true } },
    },
    orderBy: { deletedAt: "desc" },
  }) as Promise<RecentlyDeletedTask[]>;
}

export async function getRecentlyDeletedIrrigationRecords(
  blockId?: string,
): Promise<RecentlyDeletedIrrigationRecord[]> {
  await ensurePurge();

  return db.irrigationRecord.findMany({
    where: {
      ...deletedWithinRetentionWhere(),
      ...(blockId ? { blockId } : {}),
    },
    select: {
      id: true,
      appliedAt: true,
      deletedAt: true,
      method: true,
      volume: true,
      block: { select: { id: true, code: true, name: true } },
    },
    orderBy: { deletedAt: "desc" },
  }) as Promise<RecentlyDeletedIrrigationRecord[]>;
}

export async function getRecentlyDeletedIrrigationSchedules(
  blockId?: string,
): Promise<RecentlyDeletedIrrigationSchedule[]> {
  await ensurePurge();

  return db.irrigationSchedule.findMany({
    where: {
      ...deletedWithinRetentionWhere(),
      ...(blockId ? { blockId } : {}),
    },
    select: {
      id: true,
      frequency: true,
      deletedAt: true,
      block: { select: { id: true, code: true, name: true } },
    },
    orderBy: { deletedAt: "desc" },
  }) as Promise<RecentlyDeletedIrrigationSchedule[]>;
}

export async function getRecentlyDeletedMaintenanceRecords(
  equipmentId?: string,
): Promise<RecentlyDeletedMaintenanceRecord[]> {
  await ensurePurge();

  return db.maintenanceRecord.findMany({
    where: {
      ...deletedWithinRetentionWhere(),
      ...(equipmentId ? { equipmentId } : {}),
    },
    select: {
      id: true,
      performedAt: true,
      description: true,
      deletedAt: true,
      equipment: { select: { id: true, name: true } },
    },
    orderBy: { deletedAt: "desc" },
  }) as Promise<RecentlyDeletedMaintenanceRecord[]>;
}

export async function getRecentlyDeletedEquipment(): Promise<
  RecentlyDeletedEquipment[]
> {
  await ensurePurge();

  return db.equipment.findMany({
    where: deletedWithinRetentionWhere(),
    select: {
      id: true,
      name: true,
      type: true,
      status: true,
      deletedAt: true,
    },
    orderBy: { deletedAt: "desc" },
  }) as Promise<RecentlyDeletedEquipment[]>;
}
