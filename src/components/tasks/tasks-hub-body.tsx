"use client";

import { useMemo, useState } from "react";
import { ListSelectAll } from "@/components/shared/list-select-all";
import { TaskTimeline } from "@/components/tasks/task-timeline";
import { TaskListView } from "@/components/tasks/task-list-view";
import { TaskEmptyState } from "@/components/tasks/task-empty-state";
import { TasksBulkActionBar } from "@/components/tasks/tasks-bulk-action-bar";
import { TasksPagination } from "@/components/tasks/tasks-pagination";
import type { TaskListItem } from "@/domains/tasks/queries";
import type { TaskTypeConfig } from "@/domains/tasks/types";
import type { TasksHubParams } from "@/lib/hub-back-href";
import type { RecentlyDeletedTask } from "@/domains/soft-delete/queries";
import { TasksRecentlyDeleted } from "@/components/tasks/tasks-recently-deleted";

type UserOption = { id: string; name: string | null; email: string };

export function TasksHubBody({
  tasks,
  total,
  page,
  pageSize,
  view,
  emptyContext,
  backParams,
  hubParams,
  taskTypes,
  users,
  showTrash = false,
  deletedTasks = [],
}: {
  tasks: TaskListItem[];
  total: number;
  page: number;
  pageSize: number;
  view: "timeline" | "list";
  emptyContext: {
    hasFilters: boolean;
    blockId?: string;
    blockCode?: string;
    search?: string;
  };
  backParams?: TasksHubParams;
  hubParams: TasksHubParams;
  taskTypes: TaskTypeConfig[];
  users: UserOption[];
  showTrash?: boolean;
  deletedTasks?: RecentlyDeletedTask[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const visibleIds = useMemo(() => tasks.map((t) => t.id), [tasks]);
  const selectedVisibleCount = useMemo(
    () => visibleIds.filter((id) => selectedSet.has(id)).length,
    [visibleIds, selectedSet],
  );

  function toggleTask(id: string, selected: boolean) {
    setSelectedIds((prev) =>
      selected ? [...prev, id] : prev.filter((x) => x !== id),
    );
  }

  function selectAllVisible() {
    setSelectedIds((prev) => [...new Set([...prev, ...visibleIds])]);
  }

  function clearVisibleSelection() {
    const visibleSet = new Set(visibleIds);
    setSelectedIds((prev) => prev.filter((id) => !visibleSet.has(id)));
  }

  const selectionProps = {
    selectable: true as const,
    selectedIds: selectedSet,
    onToggle: toggleTask,
  };

  const showSelectAll = !showTrash && tasks.length > 0;

  return (
    <>
      {showTrash ? (
        <TasksRecentlyDeleted items={deletedTasks} />
      ) : view === "timeline" ? (
        <>
          {showSelectAll && (
            <ListSelectAll
              visibleCount={visibleIds.length}
              selectedCount={selectedVisibleCount}
              onSelectAll={selectAllVisible}
              onClearAll={clearVisibleSelection}
              className="pb-1"
            />
          )}
          <TaskTimeline
            tasks={tasks}
            emptyContext={emptyContext}
            backParams={backParams}
            {...selectionProps}
          />
        </>
      ) : tasks.length === 0 ? (
        <TaskEmptyState context={emptyContext} />
      ) : (
        <>
          <ListSelectAll
            visibleCount={visibleIds.length}
            selectedCount={selectedVisibleCount}
            onSelectAll={selectAllVisible}
            onClearAll={clearVisibleSelection}
            className="pb-1"
          />
          <TaskListView
            tasks={tasks}
            backParams={backParams}
            {...selectionProps}
          />
          <TasksPagination
            total={total}
            page={page}
            pageSize={pageSize}
            hubParams={hubParams}
          />
        </>
      )}

      {!showTrash && (
        <TasksBulkActionBar
          selectedIds={selectedIds}
          taskTypes={taskTypes}
          users={users}
          onClear={() => setSelectedIds([])}
        />
      )}
    </>
  );
}
