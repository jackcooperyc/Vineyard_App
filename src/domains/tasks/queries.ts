import { db } from "@/lib/db";
import type { Prisma, TaskStatus, TaskType } from "@/generated/prisma/client";

export type TaskListItem = {
  id: string;
  title: string;
  type: string;
  status: TaskStatus;
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt?: Date;
  block: { id: string; code: string; name: string };
  assignedTo: { name: string | null } | null;
};

export type TaskSortOption = "dueDate" | "createdAt" | "title" | "status";
export type TaskDueFilter = "overdue" | "today" | "week";

export type TaskFilters = {
  status?: TaskStatus | "ALL" | "OPEN";
  blockId?: string;
  type?: TaskType;
  search?: string;
  sort?: TaskSortOption;
  due?: TaskDueFilter;
};

export type TaskHubStats = {
  open: number;
  overdue: number;
  dueThisWeek: number;
  completedRecently: number;
};

function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfTomorrow() {
  const d = startOfToday();
  d.setDate(d.getDate() + 1);
  return d;
}

function endOfWeek() {
  const d = startOfToday();
  const day = d.getDay();
  const daysUntilSunday = day === 0 ? 0 : 7 - day;
  d.setDate(d.getDate() + daysUntilSunday);
  d.setHours(23, 59, 59, 999);
  return d;
}

function sevenDaysAgo() {
  const d = startOfToday();
  d.setDate(d.getDate() - 7);
  return d;
}

function taskOrderBy(sort: TaskSortOption = "dueDate"): Prisma.TaskOrderByWithRelationInput[] {
  switch (sort) {
    case "createdAt":
      return [{ createdAt: "desc" }];
    case "title":
      return [{ title: "asc" }];
    case "status":
      return [{ status: "asc" }, { dueDate: "asc" }];
    default:
      return [{ dueDate: "asc" }, { createdAt: "desc" }];
  }
}

export async function getTasks(filters: TaskFilters = {}): Promise<TaskListItem[]> {
  const where: Prisma.TaskWhereInput = {};

  if (filters.status === "OPEN") {
    where.status = { in: ["PENDING", "IN_PROGRESS"] };
  } else if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters.blockId) {
    where.blockId = filters.blockId;
  }

  if (filters.type) {
    where.type = filters.type;
  }

  const search = filters.search?.trim();
  if (search) {
    where.title = { contains: search, mode: "insensitive" };
  }

  const today = startOfToday();
  if (filters.due === "overdue") {
    where.dueDate = { lt: today };
  } else if (filters.due === "today") {
    where.dueDate = { gte: today, lt: startOfTomorrow() };
  } else if (filters.due === "week") {
    where.dueDate = { gte: today, lte: endOfWeek() };
  }

  return db.task.findMany({
    where,
    include: {
      block: { select: { id: true, code: true, name: true } },
      assignedTo: { select: { name: true } },
    },
    orderBy: taskOrderBy(filters.sort),
  });
}

export async function getTaskHubStats(blockId?: string): Promise<TaskHubStats> {
  const blockWhere: Prisma.TaskWhereInput = blockId ? { blockId } : {};
  const openWhere: Prisma.TaskWhereInput = {
    ...blockWhere,
    status: { in: ["PENDING", "IN_PROGRESS"] },
  };
  const today = startOfToday();
  const weekEnd = endOfWeek();
  const recentStart = sevenDaysAgo();

  const [open, overdue, dueThisWeek, completedRecently] = await Promise.all([
    db.task.count({ where: openWhere }),
    db.task.count({
      where: { ...openWhere, dueDate: { lt: today } },
    }),
    db.task.count({
      where: {
        ...openWhere,
        dueDate: { gte: today, lte: weekEnd },
      },
    }),
    db.task.count({
      where: {
        ...blockWhere,
        status: "COMPLETED",
        completedAt: { gte: recentStart },
      },
    }),
  ]);

  return { open, overdue, dueThisWeek, completedRecently };
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
