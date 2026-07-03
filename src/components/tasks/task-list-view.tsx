import { TaskListCard } from "@/components/tasks/task-list-card";
import type { TaskListItem } from "@/domains/tasks/queries";

import type { TasksHubParams } from "@/lib/hub-back-href";

export function TaskListView({
  tasks,
  backParams,
}: {
  tasks: TaskListItem[];
  backParams?: TasksHubParams;
}) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskListCard key={task.id} task={task} backParams={backParams} />
      ))}
    </div>
  );
}
