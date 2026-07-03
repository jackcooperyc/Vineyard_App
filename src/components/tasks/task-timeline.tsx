import { TaskListCard } from "@/components/tasks/task-list-card";
import { TaskEmptyState } from "@/components/tasks/task-empty-state";
import type { TaskListItem } from "@/domains/tasks/queries";
import type { TasksHubParams } from "@/lib/hub-back-href";

function formatGroupLabel(date: Date | null): string {
  if (!date) return "No due date";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diff < 0) return "Overdue";
  if (diff === 0) return "Due today";
  if (diff === 1) return "Due tomorrow";
  if (diff <= 7) return "Due this week";
  return due.toLocaleDateString(undefined, { month: "long", year: "numeric" });
}

function groupTasks(tasks: TaskListItem[]) {
  const groups = new Map<string, TaskListItem[]>();

  for (const task of tasks) {
    const label = formatGroupLabel(task.dueDate);
    const existing = groups.get(label) ?? [];
    existing.push(task);
    groups.set(label, existing);
  }

  const order = ["Overdue", "Due today", "Due tomorrow", "Due this week"];
  const sorted: { label: string; tasks: TaskListItem[] }[] = [];

  for (const label of order) {
    const group = groups.get(label);
    if (group?.length) {
      sorted.push({ label, tasks: group });
      groups.delete(label);
    }
  }

  for (const [label, groupTasks] of groups) {
    sorted.push({ label, tasks: groupTasks });
  }

  return sorted;
}

export function TaskTimeline({
  tasks,
  emptyContext,
  backParams,
  selectable,
  selectedIds,
  onToggle,
}: {
  tasks: TaskListItem[];
  emptyContext?: {
    hasFilters: boolean;
    blockId?: string;
    blockCode?: string;
    search?: string;
  };
  backParams?: TasksHubParams;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggle?: (id: string, selected: boolean) => void;
}) {
  if (tasks.length === 0) {
    return (
      <TaskEmptyState
        context={{
          hasFilters: emptyContext?.hasFilters ?? false,
          blockId: emptyContext?.blockId,
          blockCode: emptyContext?.blockCode,
          search: emptyContext?.search,
        }}
      />
    );
  }

  const groups = groupTasks(tasks);

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.label}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
            <span className="ml-2 font-normal normal-case tracking-normal">
              ({group.tasks.length})
            </span>
          </h3>
          <div className="space-y-3">
            {group.tasks.map((task) => (
              <TaskListCard
                key={task.id}
                task={task}
                backParams={backParams}
                selectable={selectable}
                selected={selectedIds?.has(task.id)}
                onSelectedChange={(selected) => onToggle?.(task.id, selected)}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
