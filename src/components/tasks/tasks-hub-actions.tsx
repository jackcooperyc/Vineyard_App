"use client";

import Link from "next/link";
import { Plus, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TasksQuickLogSheet } from "@/components/tasks/tasks-quick-log-sheet";
import type { BlockPickerItem } from "@/components/shared/block-picker";
import type { TaskTypeConfig } from "@/domains/tasks/types";

export function TasksHubActions({
  blocks,
  quickLogTypes,
  blockId,
}: {
  blocks: BlockPickerItem[];
  quickLogTypes: TaskTypeConfig[];
  blockId?: string;
}) {
  const newTaskHref = blockId ? `/tasks/new?blockId=${blockId}` : "/tasks/new";

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button
        variant="ghost"
        size="icon"
        className="hidden min-h-11 sm:inline-flex"
        render={<Link href="/tasks/settings" aria-label="Task type settings" />}
      >
        <Settings className="size-4" />
      </Button>

      <div className="hidden sm:flex sm:items-center sm:gap-2">
        <TasksQuickLogSheet
          blocks={blocks}
          quickLogTypes={quickLogTypes}
          defaultBlockId={blockId}
        />
        <Button className="min-h-11 gap-2" render={<Link href={newTaskHref} />}>
          <Plus className="size-4" />
          New task
        </Button>
      </div>
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button className="min-h-11 gap-2">
                <Plus className="size-4" />
                Add
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href={newTaskHref} />}>
              New task
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/field" />}>
              Field log
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href="/tasks/settings" />}>
              Task types
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
