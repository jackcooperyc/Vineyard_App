import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TaskStatusBadge } from "@/components/tasks/task-status-badge";
import { TaskTypeLabel } from "@/components/tasks/task-type-label";
import { TaskStatusActions } from "@/components/tasks/task-status-actions";
import { getTaskById } from "@/domains/tasks/queries";
import type { TaskType } from "@/generated/prisma/client";

export default async function TaskDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const task = await getTaskById(id);

  if (!task) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          render={<Link href="/tasks" aria-label="Back to tasks" />}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
              <TaskTypeLabel type={task.type as TaskType} />
            </span>
            <TaskStatusBadge status={task.status} />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">{task.title}</h2>
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
                  <dd className="font-medium">
                    {task.dueDate.toLocaleDateString()}
                  </dd>
                </div>
              </div>
            )}
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
                <dd className="font-medium">{task.equipment.name}</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Button variant="outline" className="min-h-11" render={<Link href={`/blocks/${task.block.id}`} />}>
        View block
      </Button>
    </div>
  );
}
