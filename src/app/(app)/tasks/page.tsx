import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TaskFilterBar,
  parseTaskStatusFilter,
} from "@/components/tasks/task-filter-bar";
import { TaskTimeline } from "@/components/tasks/task-timeline";
import { getTasks } from "@/domains/tasks/queries";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = parseTaskStatusFilter(params.status);
  const tasks = await getTasks({ status: statusFilter });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""} · vineyard work by block
          </p>
        </div>
        <Button className="min-h-11 shrink-0 gap-2" render={<Link href="/tasks/new" />}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">New task</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      <Suspense fallback={<div className="h-11 animate-pulse rounded-full bg-muted" />}>
        <TaskFilterBar />
      </Suspense>

      <TaskTimeline tasks={tasks} />
    </div>
  );
}
