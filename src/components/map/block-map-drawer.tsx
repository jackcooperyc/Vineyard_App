"use client";

import Link from "next/link";
import { ArrowRight, Droplets, ListTodo } from "lucide-react";
import { BlockStatusBadge } from "@/components/blocks/block-status-badge";
import { QuickLogIrrigationSheet } from "@/components/irrigation/quick-log-irrigation-sheet";
import { QuickLogTaskSheet } from "@/components/tasks/quick-log-task-sheet";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { MapBlock } from "@/domains/map/types";

export function BlockMapDrawer({
  block,
  equipment,
  onClose,
}: {
  block: MapBlock | null;
  equipment: { id: string; name: string; type: string }[];
  onClose: () => void;
}) {
  return (
    <Sheet open={block != null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto">
        {block && (
          <>
            <SheetHeader>
              <div className="flex flex-wrap items-center gap-2 pr-8">
                <span className="font-mono text-sm text-muted-foreground">
                  {block.code}
                </span>
                <BlockStatusBadge status={block.status} />
              </div>
              <SheetTitle>{block.name}</SheetTitle>
              <SheetDescription>
                {block.primaryVariety ?? "Mixed varieties"}
                {block.totalVines > 0 &&
                  ` · ${block.totalVines.toLocaleString()} vines`}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 px-4 pb-4">
              {(block.openTasks > 0 || block.irrigationOverdue) && (
                <ul className="space-y-1 text-sm">
                  {block.openTasks > 0 && (
                    <li className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                      <ListTodo className="size-4 shrink-0" />
                      {block.openTasks} open task
                      {block.openTasks === 1 ? "" : "s"}
                    </li>
                  )}
                  {block.irrigationOverdue && (
                    <li className="flex items-center gap-2 text-blue-700 dark:text-blue-400">
                      <Droplets className="size-4 shrink-0" />
                      Irrigation overdue
                    </li>
                  )}
                </ul>
              )}

              <div className="flex flex-wrap gap-2">
                <QuickLogTaskSheet
                  blockId={block.id}
                  blockCode={block.code}
                  blockName={block.name}
                  equipment={equipment}
                />
                <QuickLogIrrigationSheet
                  blockId={block.id}
                  blockCode={block.code}
                  blockName={block.name}
                />
                <Button
                  variant="outline"
                  render={<Link href={`/blocks/${block.id}`} />}
                >
                  View block
                  <ArrowRight className="size-4" />
                </Button>
              </div>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
