import { TaskListCard } from "@/components/tasks/task-list-card";
import type { TaskListItem } from "@/domains/tasks/queries";

import type { TasksHubParams } from "@/lib/hub-back-href";

export function TaskListView({
  tasks,
  backParams,
  selectable,
  selectedIds,
  onToggle,
}: {
  tasks: TaskListItem[];
  backParams?: TasksHubParams;
  selectable?: boolean;
  selectedIds?: Set<string>;
  onToggle?: (id: string, selected: boolean) => void;
}) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
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
  );
}
