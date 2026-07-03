import type { TaskStatus } from "@/generated/prisma/client";

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  PENDING: "Pending",
  IN_PROGRESS: "In progress",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export const TASK_STATUSES = Object.keys(TASK_STATUS_LABELS) as TaskStatus[];

export const OPEN_TASK_STATUSES: TaskStatus[] = ["PENDING", "IN_PROGRESS"];

export const TASKS_PAGE_SIZE = 50;

export function renderTitleTemplate(
  template: string,
  vars: { label: string; blockCode?: string },
): string {
  return template
    .replace(/\{\{label\}\}/g, vars.label)
    .replace(/\{\{blockCode\}\}/g, vars.blockCode ?? "");
}

export function slugFromLabel(label: string): string {
  return label
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 64) || "TASK_TYPE";
}

export function defaultTitleForTypeConfig(
  label: string,
  blockCode?: string,
  template?: string | null,
): string {
  if (template) {
    return renderTitleTemplate(template, { label, blockCode });
  }
  return blockCode ? `${label} — ${blockCode}` : label;
}

export function dueDateFromOffset(days?: number | null): Date | undefined {
  if (days == null) return undefined;
  const d = new Date();
  d.setDate(d.getDate() + days);
  d.setHours(0, 0, 0, 0);
  return d;
}
