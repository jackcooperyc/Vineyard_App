import { db } from "@/lib/db";
import type { EquipmentStatus } from "@/generated/prisma/client";
import { notDeletedWhere } from "@/lib/soft-delete";

export type EquipmentListItem = {
  id: string;
  name: string;
  type: string;
  status: EquipmentStatus;
  serialNumber: string | null;
  lastServicedAt: Date | null;
  nextServiceAt: Date | null;
  _count: { tasks: number; maintenanceRecords: number };
};

export type EquipmentFilters = {
  status?: EquipmentStatus | "ALL" | "NEEDS_SERVICE";
  type?: string;
  search?: string;
  due?: "overdue" | "week" | "month";
};

export type EquipmentHubStats = {
  operational: number;
  needsService: number;
  inMaintenance: number;
  retired: number;
};

function activeEquipmentWhere() {
  return notDeletedWhere();
}

function needsServiceWhere() {
  const now = new Date();
  return {
    ...activeEquipmentWhere(),
    status: { not: "RETIRED" as EquipmentStatus },
    OR: [
      { nextServiceAt: { lte: now } },
      { nextServiceAt: null, status: "IN_MAINTENANCE" as EquipmentStatus },
    ],
  };
}

function endOfMonth() {
  const d = new Date();
  d.setMonth(d.getMonth() + 1, 0);
  d.setHours(23, 59, 59, 999);
  return d;
}

function serviceDueWhere(due: "overdue" | "week" | "month") {
  const now = new Date();
  const weekEnd = new Date(now);
  weekEnd.setDate(weekEnd.getDate() + 7);
  weekEnd.setHours(23, 59, 59, 999);
  const monthEnd = endOfMonth();

  const base = {
    ...activeEquipmentWhere(),
    status: { not: "RETIRED" as EquipmentStatus },
    nextServiceAt: { not: null },
  };

  if (due === "overdue") {
    return { ...base, nextServiceAt: { lte: now } };
  }
  if (due === "week") {
    return { ...base, nextServiceAt: { gte: now, lte: weekEnd } };
  }
  return { ...base, nextServiceAt: { gte: now, lte: monthEnd } };
}

export async function getEquipmentHubStats(): Promise<EquipmentHubStats> {
  const now = new Date();

  const [operational, inMaintenance, retired, needsService] = await Promise.all([
    db.equipment.count({ where: { status: "ACTIVE", ...activeEquipmentWhere() } }),
    db.equipment.count({
      where: { status: "IN_MAINTENANCE", ...activeEquipmentWhere() },
    }),
    db.equipment.count({ where: { status: "RETIRED", ...activeEquipmentWhere() } }),
    db.equipment.count({
      where: {
        ...activeEquipmentWhere(),
        status: { not: "RETIRED" },
        nextServiceAt: { lte: now },
      },
    }),
  ]);

  return { operational, needsService, inMaintenance, retired };
}

export async function getEquipment(
  filters: EquipmentFilters = {},
): Promise<EquipmentListItem[]> {
  const where: Record<string, unknown> = { ...activeEquipmentWhere() };

  if (filters.status === "NEEDS_SERVICE") {
    Object.assign(where, needsServiceWhere());
  } else if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters.due) {
    Object.assign(where, serviceDueWhere(filters.due));
  }

  if (filters.type) {
    where.type = filters.type;
  }

  const search = filters.search?.trim();
  if (search) {
    where.name = { contains: search, mode: "insensitive" };
  }

  return db.equipment.findMany({
    where,
    include: {
      _count: {
        select: {
          tasks: {
            where: { status: { in: ["PENDING", "IN_PROGRESS"] }, ...notDeletedWhere() },
          },
          maintenanceRecords: { where: notDeletedWhere() },
        },
      },
    },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });
}

export async function getEquipmentById(id: string) {
  return db.equipment.findFirst({
    where: { id, ...activeEquipmentWhere() },
    include: {
      maintenanceRecords: {
        where: notDeletedWhere(),
        orderBy: { performedAt: "desc" },
        take: 10,
      },
      tasks: {
        where: { status: { in: ["PENDING", "IN_PROGRESS"] }, ...notDeletedWhere() },
        orderBy: { dueDate: "asc" },
        take: 5,
        include: {
          block: { select: { id: true, code: true, name: true } },
          taskType: {
            select: { id: true, slug: true, label: true, iconName: true, colorHex: true },
          },
        },
      },
      _count: { select: { tasks: true, maintenanceRecords: true } },
    },
  });
}

export async function getActiveEquipmentForSelect() {
  return db.equipment.findMany({
    where: {
      ...activeEquipmentWhere(),
      status: { in: ["ACTIVE", "IN_MAINTENANCE"] },
    },
    select: { id: true, name: true, type: true },
    orderBy: { name: "asc" },
  });
}

export async function getEquipmentNeedingService(limit = 5) {
  const now = new Date();
  return db.equipment.findMany({
    where: {
      ...activeEquipmentWhere(),
      status: { not: "RETIRED" },
      nextServiceAt: { lte: now },
    },
    include: {
      _count: { select: { tasks: true, maintenanceRecords: true } },
    },
    orderBy: { nextServiceAt: "asc" },
    take: limit,
  });
}

export async function countEquipmentNeedingService() {
  const now = new Date();
  return db.equipment.count({
    where: {
      ...activeEquipmentWhere(),
      status: { not: "RETIRED" },
      nextServiceAt: { lte: now },
    },
  });
}
