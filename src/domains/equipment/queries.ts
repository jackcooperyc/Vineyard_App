import { db } from "@/lib/db";
import type { EquipmentStatus } from "@/generated/prisma/client";

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
};

function needsServiceWhere() {
  const now = new Date();
  return {
    status: { not: "RETIRED" as EquipmentStatus },
    OR: [
      { nextServiceAt: { lte: now } },
      { nextServiceAt: null, status: "IN_MAINTENANCE" as EquipmentStatus },
    ],
  };
}

export async function getEquipment(
  filters: EquipmentFilters = {},
): Promise<EquipmentListItem[]> {
  const where: Record<string, unknown> = {};

  if (filters.status === "NEEDS_SERVICE") {
    Object.assign(where, needsServiceWhere());
  } else if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  return db.equipment.findMany({
    where,
    include: {
      _count: { select: { tasks: true, maintenanceRecords: true } },
    },
    orderBy: [{ status: "asc" }, { name: "asc" }],
  });
}

export async function getEquipmentById(id: string) {
  return db.equipment.findUnique({
    where: { id },
    include: {
      maintenanceRecords: {
        orderBy: { performedAt: "desc" },
        take: 10,
      },
      tasks: {
        where: { status: { in: ["PENDING", "IN_PROGRESS"] } },
        orderBy: { dueDate: "asc" },
        take: 5,
        include: {
          block: { select: { id: true, code: true, name: true } },
        },
      },
      _count: { select: { tasks: true, maintenanceRecords: true } },
    },
  });
}

export async function getActiveEquipmentForSelect() {
  return db.equipment.findMany({
    where: { status: { in: ["ACTIVE", "IN_MAINTENANCE"] } },
    select: { id: true, name: true, type: true },
    orderBy: { name: "asc" },
  });
}

export async function getEquipmentNeedingService(limit = 5) {
  const now = new Date();
  return db.equipment.findMany({
    where: {
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
      status: { not: "RETIRED" },
      nextServiceAt: { lte: now },
    },
  });
}
