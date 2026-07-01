import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TaskFilterBar,
  parseTaskStatusFilter,
  parseTaskTypeFilter,
} from "@/components/tasks/task-filter-bar";
import { TaskTimeline } from "@/components/tasks/task-timeline";
import { getBlockById } from "@/domains/blocks/queries";
import { getTasks } from "@/domains/tasks/queries";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; blockId?: string; type?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = parseTaskStatusFilter(params.status);
  const typeFilter = parseTaskTypeFilter(params.type);
  const blockId = params.blockId;

  const [tasks, block] = await Promise.all([
    getTasks({ status: statusFilter, blockId, type: typeFilter }),
    blockId ? getBlockById(blockId) : Promise.resolve(null),
  ]);

  const blockFilter =
    block && blockId
      ? { id: block.id, code: block.code, name: block.name }
      : undefined;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">
            {tasks.length} task{tasks.length !== 1 ? "s" : ""}
            {blockFilter
              ? ` · ${blockFilter.code} ${blockFilter.name}`
              : " · vineyard work by block"}
          </p>
        </div>
        <Button
          className="min-h-11 shrink-0 gap-2"
          render={
            <Link
              href={
                blockId ? `/tasks/new?blockId=${blockId}` : "/tasks/new"
              }
            />
          }
        >
          <Plus className="size-4" />
          <span className="hidden sm:inline">New task</span>
          <span className="sm:hidden">New</span>
        </Button>
      </div>

      <Suspense
        fallback={<div className="h-24 animate-pulse rounded-full bg-muted" />}
      >
        <TaskFilterBar blockFilter={blockFilter} />
      </Suspense>

      <TaskTimeline tasks={tasks} />
    </div>
  );
}
