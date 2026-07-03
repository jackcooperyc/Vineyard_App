import { Suspense } from "react";
import { TaskFilterBar } from "@/components/tasks/task-filter-bar";
import { TaskStatsChips } from "@/components/tasks/task-stats-chips";
import { TaskTimeline } from "@/components/tasks/task-timeline";
import { TaskListView } from "@/components/tasks/task-list-view";
import { TaskEmptyState } from "@/components/tasks/task-empty-state";
import { TaskViewBar } from "@/components/tasks/task-view-bar";
import { TasksHubActions } from "@/components/tasks/tasks-hub-actions";
import { TasksMobileFab } from "@/components/tasks/tasks-mobile-fab";
import { TasksPagination } from "@/components/tasks/tasks-pagination";
import { getBlockById, getVineyardBlocksForField } from "@/domains/blocks/queries";
import { getActiveEquipmentForSelect } from "@/domains/equipment/queries";
import { TASKS_PAGE_SIZE } from "@/domains/tasks/constants";
import {
  parseTaskDueFilter,
  parseTaskSortFilter,
  parseTaskStatusFilter,
  parseTaskTypeFilter,
  parseTaskView,
  taskFiltersAreActive,
} from "@/domains/tasks/filters";
import { getTaskHubStats, getTasks, getTasksCount, getUsersForAssignment } from "@/domains/tasks/queries";
import { tasksHubParamsFromSearch } from "@/lib/hub-back-href";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    blockId?: string;
    type?: string;
    q?: string;
    sort?: string;
    due?: string;
    view?: string;
    page?: string;
    assignee?: string;
    equipmentId?: string;
  }>;
}) {
  const params = await searchParams;
  const statusFilter = parseTaskStatusFilter(params.status);
  const typeFilter = parseTaskTypeFilter(params.type);
  const sortFilter = parseTaskSortFilter(params.sort);
  const dueFilter = parseTaskDueFilter(params.due);
  const view = parseTaskView(params.view);
  const blockId = params.blockId;
  const search = params.q?.trim();
  const assigneeId = params.assignee;
  const equipmentId = params.equipmentId;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const hubParams = tasksHubParamsFromSearch(params);
  const backParams = hubParams;

  const filters = {
    status: statusFilter,
    blockId,
    type: typeFilter,
    search,
    sort: sortFilter,
    due: dueFilter,
    assigneeId,
    equipmentId,
  };

  const [tasks, total, stats, block, blocks, users, equipment] = await Promise.all([
    getTasks({
      ...filters,
      skip: (page - 1) * TASKS_PAGE_SIZE,
      take: TASKS_PAGE_SIZE,
    }),
    getTasksCount(filters),
    getTaskHubStats(blockId),
    blockId ? getBlockById(blockId) : Promise.resolve(null),
    getVineyardBlocksForField(),
    getUsersForAssignment(),
    getActiveEquipmentForSelect(),
  ]);

  const blockFilter =
    block && blockId
      ? { id: block.id, code: block.code, name: block.name }
      : undefined;

  const hasFilters = taskFiltersAreActive(params);
  const emptyContext = {
    hasFilters,
    blockId,
    blockCode: blockFilter?.code,
    search,
  };

  return (
    <div className="field-readable mx-auto max-w-3xl space-y-6 pb-4">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
          <p className="text-muted-foreground">
            {total} total · {tasks.length} shown
            {blockFilter
              ? ` · ${blockFilter.code} ${blockFilter.name}`
              : " · vineyard work by block"}
          </p>
        </div>
        <TasksHubActions blocks={blocks} blockId={blockId} />
      </div>

      <TaskStatsChips stats={stats} blockId={blockId} />

      <Suspense fallback={<div className="h-11 animate-pulse rounded-full bg-muted" />}>
        <TaskViewBar />
      </Suspense>

      <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 pb-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Suspense
          fallback={<div className="h-24 animate-pulse rounded-lg bg-muted" />}
        >
          <TaskFilterBar blocks={blocks} users={users} equipment={equipment} />
        </Suspense>
      </div>

      {view === "timeline" ? (
        <TaskTimeline tasks={tasks} emptyContext={emptyContext} backParams={backParams} />
      ) : tasks.length === 0 ? (
        <TaskEmptyState context={emptyContext} />
      ) : (
        <>
          <TaskListView tasks={tasks} backParams={backParams} />
          <TasksPagination
            total={total}
            page={page}
            pageSize={TASKS_PAGE_SIZE}
            hubParams={hubParams}
          />
        </>
      )}

      <TasksMobileFab blocks={blocks} blockId={blockId} />
    </div>
  );
}
