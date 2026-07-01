import { TaskListCard } from "@/components/tasks/task-list-card";
import type { TaskListItem } from "@/domains/tasks/queries";

export function TaskListView({ tasks }: { tasks: TaskListItem[] }) {
  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <TaskListCard key={task.id} task={task} />
      ))}
    </div>
  );
}
