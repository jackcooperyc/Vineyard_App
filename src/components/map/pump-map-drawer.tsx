"use client";

import Link from "next/link";
import { Droplets } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import type { MapPumpGeo } from "@/domains/pumps/map-geo";

export function PumpMapDrawer({
  pump,
  servicedBlocks,
  onClose,
}: {
  pump: MapPumpGeo | null;
  servicedBlocks: { id: string; code: string; name: string }[];
  onClose: () => void;
}) {
  return (
    <Sheet open={pump != null} onOpenChange={(open) => !open && onClose()}>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto">
        {pump && (
          <>
            <SheetHeader>
              <div className="flex items-center gap-2 pr-8">
                <Droplets className="size-5 text-sky-500" />
                <span className="text-sm font-medium text-sky-600 dark:text-sky-400">
                  Irrigation pump
                </span>
              </div>
              <SheetTitle>{pump.name ?? "Unnamed pump"}</SheetTitle>
              <SheetDescription>
                {pump.coordinates[1].toFixed(5)}, {pump.coordinates[0].toFixed(5)}
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 px-4 pb-4">
              {servicedBlocks.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-sm font-medium">
                    Serviced blocks ({servicedBlocks.length})
                  </p>
                  <ul className="space-y-1">
                    {servicedBlocks.map((block) => (
                      <li key={block.id}>
                        <Link
                          href={`/blocks/${block.id}`}
                          className="text-sm text-primary hover:underline"
                        >
                          {block.code} — {block.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No blocks linked to this pump yet.
                </p>
              )}

                <Button
                  variant="outline"
                  className="min-h-11"
                  render={<Link href={`/pumps/${pump.id}`} />}
                >
                  Pump details
                </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
