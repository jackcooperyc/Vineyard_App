import Link from "next/link";
import { TaskListCard } from "@/components/tasks/task-list-card";
import type { TaskListItem } from "@/domains/tasks/queries";

function formatGroupLabel(date: Date | null): string {
  if (!date) return "No due date";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(date);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

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

export function TaskTimeline({ tasks }: { tasks: TaskListItem[] }) {
  const groups = groupTasks(tasks);

  if (tasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No tasks match this filter.{" "}
        <Link href="/tasks/new" className="text-primary underline-offset-4 hover:underline">
          Create one
        </Link>
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {groups.map((group) => (
        <section key={group.label}>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {group.label}
          </h3>
          <div className="space-y-3">
            {group.tasks.map((task) => (
              <TaskListCard key={task.id} task={task} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
