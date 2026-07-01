import Link from "next/link";
import { ChevronRight, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskTypeLabel } from "@/components/tasks/task-type-label";
import type { TaskListItem } from "@/domains/tasks/queries";
import type { TaskType } from "@/generated/prisma/client";

export function TaskListCard({ task }: { task: TaskListItem }) {
  return (
    <Link href={`/tasks/${task.id}`} className="block">
      <Card className="transition-colors hover:bg-muted/40 active:bg-muted/60">
        <CardContent className="flex min-h-[72px] items-center gap-3 p-4">
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                <TaskTypeLabel type={task.type as TaskType} />
              </span>
              <TaskStatusBadge status={task.status} />
            </div>
            <p className="font-medium leading-tight">{task.title}</p>
            <p className="text-sm text-muted-foreground">
              {task.block.code} · {task.block.name}
              {task.assignedTo?.name && ` · ${task.assignedTo.name}`}
            </p>
            {task.dueDate && (
              <p className="flex items-center gap-1 text-xs text-muted-foreground">
                <Calendar className="size-3" />
                Due {task.dueDate.toLocaleDateString()}
              </p>
            )}
          </div>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
