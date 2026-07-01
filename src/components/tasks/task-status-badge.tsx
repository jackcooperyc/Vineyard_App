import type { TaskStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { TASK_STATUS_LABELS } from "@/domains/tasks/constants";
import { cn } from "@/lib/utils";

const statusConfig: Record<TaskStatus, { className: string }> = {
  PENDING: {
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  IN_PROGRESS: {
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  COMPLETED: {
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  CANCELLED: {
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function TaskStatusBadge({
  status,
  className,
}: {
  status: TaskStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(statusConfig[status].className, className)}>
      {TASK_STATUS_LABELS[status]}
    </Badge>
  );
}
