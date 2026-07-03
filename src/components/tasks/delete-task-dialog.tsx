"use client";

import { useRouter } from "next/navigation";
import { deleteTask } from "@/domains/tasks/actions";
import { SoftDeleteSheet } from "@/components/soft-delete/soft-delete-sheet";
import { buildTasksHubHref } from "@/lib/hub-back-href";
import type { TasksHubParams } from "@/lib/hub-back-href";

export function DeleteTaskDialog({
  taskId,
  taskTitle,
  backParams = {},
}: {
  taskId: string;
  taskTitle: string;
  backParams?: TasksHubParams;
}) {
  const router = useRouter();

  return (
    <SoftDeleteSheet
      title={`Delete "${taskTitle}"?`}
      triggerLabel="Delete task"
      onDelete={() => deleteTask(taskId)}
      onSuccess={() => {
        router.push(buildTasksHubHref(backParams));
      }}
    />
  );
}
