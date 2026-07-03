import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, MapPin, Pencil, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { DeleteTaskDialog } from "@/components/tasks/delete-task-dialog";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskTypeIcon } from "@/components/tasks/task-type-icon";
import { TaskTypeLabel } from "@/components/tasks/task-type-label";
import { TaskStatusActions } from "@/components/tasks/task-status-actions";
import {
  dueUrgencyStyles,
  formatDueLabel,
  getDueUrgency,
} from "@/domains/tasks/due-date";
import { TaskGpsSessions } from "@/components/tasks/task-gps-sessions";
import { getTaskById } from "@/domains/tasks/queries";
import { buildTasksHubHref, decodeBackParams, encodeBackParams } from "@/lib/hub-back-href";
import { cn } from "@/lib/utils";

export default async function TaskDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const backParams = decodeBackParams(sp);
  const task = await getTaskById(id);

  if (!task) {
    notFound();
  }

  const isOpen = task.status === "PENDING" || task.status === "IN_PROGRESS";
  const urgency = getDueUrgency(task.dueDate);
  const dueLabel = formatDueLabel(task.dueDate);
  const urgencyStyle = dueUrgencyStyles[urgency];
  const backHref = buildTasksHubHref(backParams);
  const editHref = `/tasks/${task.id}/edit${encodeBackParams(backParams)}`;

  return (
    <div className="field-readable mx-auto max-w-3xl space-y-6">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          render={<Link href={backHref} aria-label="Back to tasks" />}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
              <TaskTypeIcon iconName={task.taskType.iconName} className="size-5" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">
                  <TaskTypeLabel label={task.taskType.label} />
                </span>
                <TaskStatusBadge status={task.status} />
                {urgency === "overdue" && isOpen && (
                  <Badge variant="outline" className={cn("text-xs", urgencyStyle.badge)}>
                    Overdue
                  </Badge>
                )}
              </div>
              <h2 className="text-2xl font-semibold tracking-tight">{task.title}</h2>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            <Link
              href={`/blocks/${task.block.id}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {task.block.code} · {task.block.name}
            </Link>
          </p>
        </div>
      </div>

      <TaskStatusActions taskId={task.id} status={task.status} />

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="min-h-11 gap-2"
          render={<Link href={editHref} />}
        >
          <Pencil className="size-4" />
          Edit task
        </Button>
        <DeleteTaskDialog
          taskId={task.id}
          taskTitle={task.title}
          backParams={backParams}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
          <CardDescription>{task.block.vineyard.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {task.description && (
            <p className="text-sm whitespace-pre-wrap">{task.description}</p>
          )}
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {task.dueDate && (
              <div className="flex items-center gap-2">
                <Calendar className="size-4 text-muted-foreground" />
                <div>
                  <dt className="text-muted-foreground">Due date</dt>
                  <dd className={cn("font-medium", isOpen && urgencyStyle.text)}>
                    {dueLabel ?? task.dueDate.toLocaleDateString()}
                  </dd>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <div>
                <dt className="text-muted-foreground">Created</dt>
                <dd className="font-medium">
                  {task.createdAt.toLocaleDateString()}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="size-4 text-muted-foreground" />
              <div>
                <dt className="text-muted-foreground">Last updated</dt>
                <dd className="font-medium">
                  {task.updatedAt.toLocaleDateString()}
                </dd>
              </div>
            </div>
            {task.assignedTo && (
              <div className="flex items-center gap-2">
                <User className="size-4 text-muted-foreground" />
                <div>
                  <dt className="text-muted-foreground">Assigned to</dt>
                  <dd className="font-medium">
                    {task.assignedTo.name ?? task.assignedTo.email}
                  </dd>
                </div>
              </div>
            )}
            {task.completedAt && (
              <div>
                <dt className="text-muted-foreground">Completed</dt>
                <dd className="font-medium">
                  {task.completedAt.toLocaleDateString()}
                </dd>
              </div>
            )}
            {task.equipment && (
              <div>
                <dt className="text-muted-foreground">Equipment</dt>
                <dd className="font-medium">
                  <Link
                    href={`/equipment/${task.equipment.id}`}
                    className="text-primary underline-offset-4 hover:underline"
                  >
                    {task.equipment.name}
                  </Link>
                  <span className="text-muted-foreground"> · {task.equipment.type}</span>
                </dd>
              </div>
            )}
            {task.taskType.tracksGpsProgress && task.coveragePct != null && (
              <div>
                <dt className="text-muted-foreground">GPS coverage</dt>
                <dd className="font-medium tabular-nums">
                  {Math.round(task.coveragePct)}% of block
                  {task.rowsTotal != null && task.rowsTotal > 0 && (
                    <span className="text-muted-foreground">
                      {" "}
                      · {task.rowsCompleted ?? 0}/{task.rowsTotal} rows
                    </span>
                  )}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <TaskGpsSessions taskId={task.id} blockId={task.block.id} />

      <div className="flex flex-wrap gap-2">
        {task.taskType.tracksGpsProgress && (
          <Button
            variant="outline"
            className="min-h-11 gap-2"
            render={<Link href={`/map?block=${task.block.id}`} />}
          >
            <MapPin className="size-4" />
            View on map
          </Button>
        )}
        <Button variant="outline" className="min-h-11" render={<Link href={`/blocks/${task.block.id}`} />}>
          View block
        </Button>
      </div>
    </div>
  );
}
