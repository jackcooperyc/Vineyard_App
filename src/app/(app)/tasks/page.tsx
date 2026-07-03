import { Suspense } from "react";
import { TaskFilterBar } from "@/components/tasks/task-filter-bar";
import { TaskStatsChips } from "@/components/tasks/task-stats-chips";
import { TaskViewBar } from "@/components/tasks/task-view-bar";
import { TasksHubActions } from "@/components/tasks/tasks-hub-actions";
import { TasksMobileFab } from "@/components/tasks/tasks-mobile-fab";
import { TasksHubBody } from "@/components/tasks/tasks-hub-body";
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
import { getTaskTypes } from "@/domains/tasks/type-queries";
import { getRecentlyDeletedTasks } from "@/domains/soft-delete/queries";
import { tasksHubParamsFromSearch } from "@/lib/hub-back-href";
import { parseTaskTrashFilter } from "@/domains/tasks/filters";

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
    trash?: string;
  }>;
}) {
  const params = await searchParams;
  const showTrash = parseTaskTrashFilter(params.trash);
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
    typeSlug: typeFilter,
    search,
    sort: sortFilter,
    due: dueFilter,
    assigneeId,
    equipmentId,
  };

  const [tasks, total, stats, block, blocks, users, equipment, taskTypes, quickLogTypes, deletedTasks] =
    await Promise.all([
      showTrash
        ? Promise.resolve([])
        : getTasks({
            ...filters,
            skip: (page - 1) * TASKS_PAGE_SIZE,
            take: TASKS_PAGE_SIZE,
          }),
      showTrash ? Promise.resolve(0) : getTasksCount(filters),
      getTaskHubStats(blockId),
      blockId ? getBlockById(blockId) : Promise.resolve(null),
      getVineyardBlocksForField(),
      getUsersForAssignment(),
      getActiveEquipmentForSelect(),
      getTaskTypes({ activeOnly: true }),
      getTaskTypes({ activeOnly: true, quickLogOnly: true }),
      showTrash ? getRecentlyDeletedTasks(blockId) : Promise.resolve([]),
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
            {showTrash
              ? `${deletedTasks.length} recently deleted`
              : `${total} total · ${tasks.length} shown`}
            {blockFilter
              ? ` · ${blockFilter.code} ${blockFilter.name}`
              : showTrash
                ? ""
                : " · vineyard work by block"}
          </p>
        </div>
        <TasksHubActions
          blocks={blocks}
          quickLogTypes={quickLogTypes}
          blockId={blockId}
        />
      </div>

      <TaskStatsChips stats={stats} blockId={blockId} />

      <Suspense fallback={<div className="h-11 animate-pulse rounded-full bg-muted" />}>
        <TaskViewBar />
      </Suspense>

      <div className="sticky top-0 z-10 -mx-4 bg-background/95 px-4 pb-3 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <Suspense
          fallback={<div className="h-24 animate-pulse rounded-lg bg-muted" />}
        >
          <TaskFilterBar
            blocks={blocks}
            users={users}
            equipment={equipment}
            taskTypes={taskTypes}
          />
        </Suspense>
      </div>

      <TasksHubBody
        tasks={tasks}
        total={total}
        page={page}
        pageSize={TASKS_PAGE_SIZE}
        view={view}
        emptyContext={emptyContext}
        backParams={backParams}
        hubParams={hubParams}
        taskTypes={taskTypes}
        users={users}
        showTrash={showTrash}
        deletedTasks={deletedTasks}
      />

      <TasksMobileFab
        blocks={blocks}
        quickLogTypes={quickLogTypes}
        blockId={blockId}
      />
    </div>
  );
}
