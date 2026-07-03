import { unstable_cache } from "next/cache";
import { db } from "@/lib/db";
import type { TaskTypeConfig } from "@/domains/tasks/types";

const TASK_TYPES_CACHE_TTL = 900;

const taskTypeSelect = {
  id: true,
  slug: true,
  label: true,
  iconName: true,
  colorHex: true,
  sortOrder: true,
  active: true,
  showInQuickLog: true,
  defaultTitleTemplate: true,
  defaultDueDaysOffset: true,
  tracksGpsProgress: true,
  defaultSwathWidthM: true,
} as const;

const getCachedTaskTypes = unstable_cache(
  async (): Promise<TaskTypeConfig[]> => {
    return db.taskTypeDefinition.findMany({
      select: taskTypeSelect,
      orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
    });
  },
  ["task-type-definitions"],
  { revalidate: TASK_TYPES_CACHE_TTL, tags: ["task-types"] },
);

export async function getTaskTypes(options?: {
  activeOnly?: boolean;
  quickLogOnly?: boolean;
}): Promise<TaskTypeConfig[]> {
  const all = await getCachedTaskTypes();
  return all.filter((t) => {
    if (options?.activeOnly && !t.active) return false;
    if (options?.quickLogOnly && !t.showInQuickLog) return false;
    return true;
  });
}

export async function getQuickLogTaskTypes(): Promise<TaskTypeConfig[]> {
  return getTaskTypes({ activeOnly: true, quickLogOnly: true });
}

export async function getTaskTypeById(id: string) {
  return db.taskTypeDefinition.findUnique({
    where: { id },
    select: {
      ...taskTypeSelect,
      _count: { select: { tasks: true } },
    },
  });
}

export async function getTaskTypeBySlug(slug: string) {
  return db.taskTypeDefinition.findUnique({
    where: { slug },
    select: taskTypeSelect,
  });
}

export async function getTaskTypesForSettings() {
  return db.taskTypeDefinition.findMany({
    select: {
      ...taskTypeSelect,
      _count: { select: { tasks: true } },
    },
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });
}
