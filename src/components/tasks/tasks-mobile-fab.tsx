"use client";

import { TasksQuickLogSheet } from "@/components/tasks/tasks-quick-log-sheet";
import type { BlockPickerItem } from "@/components/shared/block-picker";
import type { TaskTypeConfig } from "@/domains/tasks/types";

export function TasksMobileFab({
  blocks,
  quickLogTypes,
  blockId,
}: {
  blocks: BlockPickerItem[];
  quickLogTypes: TaskTypeConfig[];
  blockId?: string;
}) {
  return (
    <div className="fixed right-4 bottom-24 z-40 sm:hidden">
      <TasksQuickLogSheet
        blocks={blocks}
        quickLogTypes={quickLogTypes}
        defaultBlockId={blockId}
        fab
      />
    </div>
  );
}
