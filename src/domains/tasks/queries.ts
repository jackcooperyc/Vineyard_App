import { db } from "@/lib/db";
import type { TaskStatus } from "@/generated/prisma/client";

export type TaskListItem = {
  id: string;
  title: string;
  type: string;
  status: TaskStatus;
  dueDate: Date | null;
  completedAt: Date | null;
  block: { id: string; code: string; name: string };
  assignedTo: { name: string | null } | null;
};

export type TaskFilters = {
  status?: TaskStatus | "ALL" | "OPEN";
  blockId?: string;
};

export async function getTasks(filters: TaskFilters = {}): Promise<TaskListItem[]> {
  const where: {
    status?: { in: TaskStatus[] } | TaskStatus;
    blockId?: string;
  } = {};

  if (filters.status === "OPEN") {
    where.status = { in: ["PENDING", "IN_PROGRESS"] };
  } else if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters.blockId) {
    where.blockId = filters.blockId;
  }

  return db.task.findMany({
    where,
    include: {
      block: { select: { id: true, code: true, name: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: [{ dueDate: "asc" }, { createdAt: "desc" }],
  });
}

export async function getTaskById(id: string) {
  return db.task.findUnique({
    where: { id },
    include: {
      block: {
        select: { id: true, code: true, name: true, vineyard: { select: { name: true } } },
      },
      assignedTo: { select: { id: true, name: true, email: true } },
      equipment: { select: { id: true, name: true, type: true } },
    },
  });
}

export async function getBlocksForTaskForm() {
  return db.block.findMany({
    where: { blockType: "VINEYARD" },
    select: { id: true, code: true, name: true },
    orderBy: { code: "asc" },
  });
}

export async function getUsersForAssignment() {
  return db.user.findMany({
    select: { id: true, name: true, email: true },
    orderBy: { name: "asc" },
  });
}

export async function getTaskCountsByStatus() {
  const counts = await db.task.groupBy({
    by: ["status"],
    _count: { status: true },
  });

  return Object.fromEntries(
    counts.map((c) => [c.status, c._count.status]),
  ) as Partial<Record<TaskStatus, number>>;
}

export async function getUpcomingTasks(limit = 5) {
  return db.task.findMany({
    where: {
      status: { in: ["PENDING", "IN_PROGRESS"] },
      dueDate: { not: null },
    },
    include: {
      block: { select: { id: true, code: true, name: true } },
    },
    orderBy: { dueDate: "asc" },
    take: limit,
  });
}
