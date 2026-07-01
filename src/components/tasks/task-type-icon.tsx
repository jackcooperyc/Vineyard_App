import {
  Grape,
  ListTodo,
  Scissors,
  Search,
  SprayCan,
  type LucideIcon,
} from "lucide-react";
import type { TaskType } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

const taskTypeIcons: Record<TaskType, LucideIcon> = {
  PRUNING: Scissors,
  SPRAYING: SprayCan,
  HARVESTING: Grape,
  INSPECTION: Search,
  OTHER: ListTodo,
};

export function TaskTypeIcon({
  type,
  className,
}: {
  type: TaskType;
  className?: string;
}) {
  const Icon = taskTypeIcons[type];
  return <Icon className={cn("size-4 shrink-0", className)} aria-hidden />;
}
