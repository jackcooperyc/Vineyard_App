"use client";

import { TasksQuickLogSheet } from "@/components/tasks/tasks-quick-log-sheet";
import type { BlockPickerItem } from "@/components/shared/block-picker";

export function TasksMobileFab({
  blocks,
  blockId,
}: {
  blocks: BlockPickerItem[];
  blockId?: string;
}) {
  return (
    <div className="fixed right-4 bottom-24 z-40 sm:hidden">
      <TasksQuickLogSheet blocks={blocks} defaultBlockId={blockId} fab />
    </div>
  );
}
