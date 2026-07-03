"use client";

import { restoreTask } from "@/domains/tasks/actions";
import { RecentlyDeletedPanel } from "@/components/soft-delete/recently-deleted-panel";
import type { RecentlyDeletedTask } from "@/domains/soft-delete/queries";

export function TasksRecentlyDeleted({
  items,
}: {
  items: RecentlyDeletedTask[];
}) {
  return (
    <RecentlyDeletedPanel
      items={items.map((item) => ({
        id: item.id,
        deletedAt: item.deletedAt,
        title: item.title,
        subtitle: `${item.taskType.label} · ${item.block.code} ${item.block.name}`,
        restore: () => restoreTask(item.id),
      }))}
      emptyMessage="No recently deleted tasks."
    />
  );
}
