import type { TaskType } from "@/generated/prisma/client";
import { TASK_TYPE_LABELS } from "@/domains/tasks/constants";

export function TaskTypeLabel({ type }: { type: TaskType }) {
  return <span>{TASK_TYPE_LABELS[type]}</span>;
}
