import Link from "next/link";
import { ChevronRight, Calendar, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskTypeIcon } from "@/components/tasks/task-type-icon";
import { TaskTypeLabel } from "@/components/tasks/task-type-label";
import {
  dueUrgencyStyles,
  formatDueLabel,
  getDueUrgency,
} from "@/domains/tasks/due-date";
import type { TaskListItem } from "@/domains/tasks/queries";
import type { TaskType } from "@/generated/prisma/client";
import { buildDetailHref } from "@/lib/hub-back-href";
import type { TasksHubParams } from "@/lib/hub-back-href";
import { cn } from "@/lib/utils";

export function TaskListCard({
  task,
  backParams,
}: {
  task: TaskListItem;
  backParams?: TasksHubParams;
}) {
  const urgency = getDueUrgency(task.dueDate);
  const dueLabel = formatDueLabel(task.dueDate);
  const urgencyStyle = dueUrgencyStyles[urgency];
  const isOpen = task.status === "PENDING" || task.status === "IN_PROGRESS";

  return (
    <Link
      href={buildDetailHref("/tasks", task.id, backParams)}
      className="block"
    >
      <Card
        className={cn(
          "transition-colors hover:bg-muted/40 active:bg-muted/60",
          urgency === "overdue" &&
            isOpen &&
            "border-red-200/80 dark:border-red-900/40",
          urgency === "today" &&
            isOpen &&
            "border-amber-200/80 dark:border-amber-900/40",
        )}
      >
        <CardContent className="flex min-h-[80px] items-center gap-3 p-4">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50",
              urgency === "overdue" &&
                isOpen &&
                "border-red-200 bg-red-50 text-red-700 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-300",
              urgency === "today" &&
                isOpen &&
                "border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300",
            )}
          >
            <TaskTypeIcon type={task.type as TaskType} />
          </div>

          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                <TaskTypeLabel type={task.type as TaskType} />
              </span>
              <TaskStatusBadge status={task.status} />
              {urgency === "overdue" && isOpen && (
                <Badge
                  variant="outline"
                  className={cn("text-xs", urgencyStyle.badge)}
                >
                  Overdue
                </Badge>
              )}
            </div>
            <p className="font-medium leading-tight">{task.title}</p>
            <p className="truncate text-sm text-muted-foreground">
              <span className="font-mono text-xs">{task.block.code}</span>
              {" · "}
              {task.block.name}
            </p>
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {dueLabel && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1",
                    isOpen ? urgencyStyle.text : "text-muted-foreground",
                  )}
                >
                  <Calendar className="size-3" />
                  {dueLabel}
                </span>
              )}
              {task.assignedTo?.name && (
                <span className="inline-flex items-center gap-1 text-muted-foreground">
                  <User className="size-3" />
                  {task.assignedTo.name}
                </span>
              )}
            </div>
          </div>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
