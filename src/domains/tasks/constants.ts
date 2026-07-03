import type { TaskStatus, TaskType } from "@/generated/prisma/client";

export const TASK_TYPE_LABELS: Record<TaskType, string> = {
  PRUNING: "Pruning",
  SPRAYING: "Spraying",
  HARVESTING: "Harvesting",
  INSPECTION: "Inspection",
  OTHER: "Other",
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const TASK_TYPES = Object.keys(TASK_TYPE_LABELS) as TaskType[];

export const TASK_STATUSES = Object.keys(TASK_STATUS_LABELS) as TaskStatus[];

export const OPEN_TASK_STATUSES: TaskStatus[] = ["PENDING", "IN_PROGRESS"];

export const QUICK_LOG_TYPES: TaskType[] = [
  "PRUNING",
  "SPRAYING",
  "HARVESTING",
  "INSPECTION",
  "OTHER",
];

export function defaultTitleForType(type: TaskType, blockCode?: string): string {
  const label = TASK_TYPE_LABELS[type];
  return blockCode ? `${label} — ${blockCode}` : label;
}

export const TASKS_PAGE_SIZE = 50;
