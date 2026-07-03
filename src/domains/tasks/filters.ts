import type { TaskDueFilter, TaskSortOption } from "@/domains/tasks/queries";
import type { TaskStatus } from "@/generated/prisma/client";

export function parseTaskStatusFilter(
  value: string | undefined,
): TaskStatus | "ALL" | "OPEN" {
  if (!value || value === "OPEN") return "OPEN";
  if (value === "ALL") return "ALL";
  if (["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(value)) {
    return value as TaskStatus;
  }
  return "OPEN";
}

export function parseTaskTypeFilter(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined;
  return value;
}

export function parseTaskSortFilter(
  value: string | undefined,
): TaskSortOption {
  if (value === "createdAt" || value === "title" || value === "status") {
    return value;
  }
  return "dueDate";
}

export function parseTaskDueFilter(
  value: string | undefined,
): TaskDueFilter | undefined {
  if (value === "overdue" || value === "today" || value === "week") {
    return value;
  }
  return undefined;
}

export function parseTaskView(
  value: string | undefined,
): "timeline" | "list" {
  if (value === "list") return "list";
  return "timeline";
}

export function taskFiltersAreActive(params: {
  status?: string;
  blockId?: string;
  type?: string;
  q?: string;
  sort?: string;
  due?: string;
  view?: string;
  assignee?: string;
  equipmentId?: string;
  page?: string;
}) {
  return Boolean(
    params.status ||
      params.blockId ||
      params.type ||
      params.q ||
      (params.sort && params.sort !== "dueDate") ||
      params.due ||
      (params.view && params.view !== "timeline") ||
      params.assignee ||
      params.equipmentId ||
      (params.page && params.page !== "1"),
  );
}
