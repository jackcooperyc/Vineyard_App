"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TasksQuickLogSheet } from "@/components/tasks/tasks-quick-log-sheet";
import type { BlockPickerItem } from "@/components/shared/block-picker";

export function TasksHubActions({
  blocks,
  blockId,
}: {
  blocks: BlockPickerItem[];
  blockId?: string;
}) {
  const newTaskHref = blockId ? `/tasks/new?blockId=${blockId}` : "/tasks/new";

  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="hidden sm:flex sm:items-center sm:gap-2">
        <TasksQuickLogSheet blocks={blocks} defaultBlockId={blockId} />
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
