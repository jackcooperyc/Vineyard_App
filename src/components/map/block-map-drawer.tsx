"use client";

import Link from "next/link";
import { ArrowRight, Droplets, ListTodo, Mountain, Tractor } from "lucide-react";
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
import type { MapPumpGeo } from "@/domains/pumps/map-geo";
import type { TaskTypeConfig } from "@/domains/tasks/types";

export function BlockMapDrawer({
  block,
  equipment,
  quickLogTypes,
  vineyardBlocks,
  pumps = [],
  onClose,
}: {
  block: MapBlock | null;
  equipment: { id: string; name: string; type: string }[];
  quickLogTypes: TaskTypeConfig[];
  vineyardBlocks: { id: string; code: string; name: string }[];
  pumps?: MapPumpGeo[];
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
              <SheetDescription className="flex flex-wrap items-center gap-1.5">
                {block.blockType === "INFRASTRUCTURE" ? (
                  block.infrastructureType ?? "Infrastructure area"
                ) : (
                  <>
                    {block.varietyColorHex && (
                      <span
                        className="inline-block size-3 shrink-0 rounded-sm ring-1 ring-black/20"
                        style={{ backgroundColor: block.varietyColorHex }}
                        aria-hidden
                      />
                    )}
                    {block.primaryVariety ?? "Mixed varieties"}
                  </>
                )}
                {block.acreage != null && ` · ${block.acreage} ac`}
                {block.totalVines > 0 &&
                  ` · ${block.totalVines.toLocaleString()} vines`}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 px-4 pb-4">
              {block.elevMed != null && (
                <div className="flex items-start gap-2 rounded-lg border bg-muted/40 px-3 py-2 text-sm">
                  <Mountain className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                  <div>
                    <p className="font-medium">Elevation</p>
                    <p className="text-muted-foreground">
                      {block.elevMin != null && block.elevMax != null
                        ? `${block.elevMin.toFixed(1)}–${block.elevMax.toFixed(1)} m`
                        : null}
                      {block.elevMin != null &&
                        block.elevMax != null &&
                        block.elevMed != null &&
                        " · "}
                      {block.elevMed != null &&
                        `median ${block.elevMed.toFixed(1)} m`}
                    </p>
                  </div>
                </div>
              )}

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

              {block.openTaskEquipment.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Equipment in use</p>
                  <ul className="space-y-1 text-sm text-muted-foreground">
                    {block.openTaskEquipment.map((item) => (
                      <li key={item.id} className="flex items-center gap-2">
                        <Tractor className="size-4 shrink-0" />
                        <Link
                          href={`/equipment/${item.id}`}
                          className="text-primary underline-offset-4 hover:underline"
                        >
                          {item.name}
                        </Link>
                        <span>· {item.type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {pumps.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">Irrigation pumps</p>
                  <ul className="space-y-1 text-sm">
                    {pumps.map((pump) => (
                      <li key={pump.id}>
                        <Link
                          href={`/map?pump=${pump.id}`}
                          className="flex items-center gap-2 text-primary hover:underline"
                        >
                          <Droplets className="size-4 shrink-0 text-sky-500" />
                          {pump.name ?? "Unnamed pump"}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <QuickLogTaskSheet
                  blockId={block.id}
                  blockCode={block.code}
                  blockName={block.name}
                  blocks={vineyardBlocks}
                  equipment={equipment}
                  quickLogTypes={quickLogTypes}
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
