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
import { IrrigationHubQuickLogSheet } from "@/components/irrigation/irrigation-hub-quick-log-sheet";
import type { BlockPickerItem } from "@/components/shared/block-picker";

export function IrrigationHubActions({
  blocks,
  blockId,
}: {
  blocks: BlockPickerItem[];
  blockId?: string;
}) {
  const newScheduleHref = blockId
    ? `/irrigation/schedules/new?blockId=${blockId}`
    : "/irrigation/schedules/new";
  const newRecordHref = blockId
    ? `/irrigation/records/new?blockId=${blockId}`
    : "/irrigation/records/new";

  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="hidden sm:flex sm:items-center sm:gap-2">
        <IrrigationHubQuickLogSheet blocks={blocks} defaultBlockId={blockId} />
        <Button className="min-h-11 gap-2" render={<Link href={newScheduleHref} />}>
          <Plus className="size-4" />
          New schedule
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
            <DropdownMenuItem render={<Link href={newScheduleHref} />}>
              New schedule
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href={newRecordHref} />}>
              Log irrigation
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
