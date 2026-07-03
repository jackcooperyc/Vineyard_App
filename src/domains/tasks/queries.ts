import { db } from "@/lib/db";
import type { Prisma, TaskStatus } from "@/generated/prisma/client";
import type { TaskTypeConfig } from "@/domains/tasks/types";
import { notDeletedWhere } from "@/lib/soft-delete";

export type TaskTypeSummary = {
  id: string;
  slug: string;
  label: string;
  iconName: string;
  colorHex: string | null;
};

export type TaskListItem = {
  id: string;
  title: string;
  taskType: TaskTypeSummary & { tracksGpsProgress?: boolean };
  status: TaskStatus;
  dueDate: Date | null;
  completedAt: Date | null;
  createdAt?: Date;
  coveragePct?: number | null;
  rowsCompleted?: number | null;
  rowsTotal?: number | null;
  block: { id: string; code: string; name: string };
  assignedTo: { name: string | null } | null;
};

export type TaskSortOption = "dueDate" | "createdAt" | "title" | "status";
export type TaskDueFilter = "overdue" | "today" | "week";

export type TaskFilters = {
  status?: TaskStatus | "ALL" | "OPEN";
  blockId?: string;
  typeSlug?: string;
  taskTypeId?: string;
  search?: string;
  sort?: TaskSortOption;
  due?: TaskDueFilter;
  assigneeId?: string;
  equipmentId?: string;
  skip?: number;
  take?: number;
};

export type TaskHubStats = {
  open: number;
  overdue: number;
  dueThisWeek: number;
  completedRecently: number;
};

const taskTypeSelect = {
  id: true,
  slug: true,
  label: true,
  iconName: true,
  colorHex: true,
  tracksGpsProgress: true,
} as const;

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

function buildTaskWhere(filters: TaskFilters): Prisma.TaskWhereInput {
  const where: Prisma.TaskWhereInput = { ...notDeletedWhere() };

  if (filters.status === "OPEN") {
    where.status = { in: ["PENDING", "IN_PROGRESS"] };
  } else if (filters.status && filters.status !== "ALL") {
    where.status = filters.status;
  }

  if (filters.blockId) {
    where.blockId = filters.blockId;
  }

  if (filters.taskTypeId) {
    where.taskTypeId = filters.taskTypeId;
  } else if (filters.typeSlug) {
    where.taskType = { slug: filters.typeSlug };
  }

  if (filters.assigneeId) {
    where.assignedToId = filters.assigneeId;
  }

  if (filters.equipmentId) {
    where.equipmentId = filters.equipmentId;
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

  return where;
}

export async function getTasks(filters: TaskFilters = {}): Promise<TaskListItem[]> {
  return db.task.findMany({
    where: buildTaskWhere(filters),
    include: {
      block: { select: { id: true, code: true, name: true } },
      assignedTo: { select: { name: true } },
      taskType: { select: taskTypeSelect },
    },
    orderBy: taskOrderBy(filters.sort),
    ...(filters.skip != null ? { skip: filters.skip } : {}),
    ...(filters.take != null ? { take: filters.take } : {}),
  });
}

export async function getTasksCount(filters: TaskFilters = {}): Promise<number> {
  return db.task.count({ where: buildTaskWhere(filters) });
}

export async function getTaskHubStats(blockId?: string): Promise<TaskHubStats> {
  const blockWhere: Prisma.TaskWhereInput = {
    ...notDeletedWhere(),
    ...(blockId ? { blockId } : {}),
  };
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
  return db.task.findFirst({
    where: { id, ...notDeletedWhere() },
    include: {
      block: {
        select: { id: true, code: true, name: true, vineyard: { select: { name: true } } },
      },
      taskType: { select: taskTypeSelect },
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
    where: notDeletedWhere(),
    _count: { status: true },
  });

  return Object.fromEntries(
    counts.map((c) => [c.status, c._count.status]),
  ) as Partial<Record<TaskStatus, number>>;
}

export async function getUpcomingTasks(limit = 5) {
  return db.task.findMany({
    where: {
      ...notDeletedWhere(),
      status: { in: ["PENDING", "IN_PROGRESS"] },
      dueDate: { not: null },
    },
    include: {
      block: { select: { id: true, code: true, name: true } },
      taskType: { select: taskTypeSelect },
    },
    orderBy: { dueDate: "asc" },
    take: limit,
  });
}

export function toTaskTypeSummary(config: TaskTypeConfig): TaskTypeSummary {
  return {
    id: config.id,
    slug: config.slug,
    label: config.label,
    iconName: config.iconName,
    colorHex: config.colorHex,
  };
}
