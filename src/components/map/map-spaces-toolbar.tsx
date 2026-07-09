"use client";

import { useState } from "react";
import { Layers, Pencil, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { USER_MAP_SPACE_COLOR_HEX } from "@/domains/map/constants";
import type { MapBlock } from "@/domains/map/types";

type MapSpacesToolbarProps = {
  spaces: MapBlock[];
  canEdit: boolean;
  drawActive: boolean;
  onStartDraw: () => void;
  onCancelDraw: () => void;
  onSelectSpace: (blockId: string) => void;
  onManageSpace: (space: MapBlock) => void;
};

export function MapSpacesToolbar({
  spaces,
  canEdit,
  drawActive,
  onStartDraw,
  onCancelDraw,
  onSelectSpace,
  onManageSpace,
}: MapSpacesToolbarProps) {
  const [listOpen, setListOpen] = useState(false);

  return (
    <div className="pointer-events-auto absolute top-3 left-14 z-10 flex flex-col gap-2 sm:left-16">
      {drawActive ? (
        <div className="flex max-w-xs flex-col gap-2 rounded-lg border bg-background/95 p-3 shadow-md backdrop-blur">
          <p className="text-sm font-medium">Draw a polygon</p>
          <p className="text-xs text-muted-foreground">
            Click to place vertices, double-click to finish. Press Esc to cancel.
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-h-9"
            onClick={onCancelDraw}
          >
            <X className="size-4" />
            Cancel drawing
          </Button>
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {canEdit && (
            <Button
              type="button"
              size="sm"
              className="min-h-9 shadow-md"
              onClick={onStartDraw}
            >
              <Plus className="size-4" />
              Add space
            </Button>
          )}
          <Sheet open={listOpen} onOpenChange={setListOpen}>
            <SheetTrigger
              render={
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="min-h-9 bg-background/95 shadow-md backdrop-blur"
                >
                  <Layers className="size-4" />
                  Spaces
                  {spaces.length > 0 && (
                    <span className="ml-1 rounded-full bg-muted px-1.5 text-xs">
                      {spaces.length}
                    </span>
                  )}
                </Button>
              }
            />
            <SheetContent side="bottom" className="max-h-[70dvh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Custom map spaces</SheetTitle>
                <SheetDescription>
                  User-drawn areas on the estate map. Vineyard blocks and seeded
                  infrastructure are managed separately.
                </SheetDescription>
              </SheetHeader>
              <ul className="space-y-2 px-4 pb-4">
                {spaces.length === 0 ? (
                  <li className="rounded-lg border border-dashed px-3 py-6 text-center text-sm text-muted-foreground">
                    No custom spaces yet.
                    {canEdit && " Tap Add space to draw one on the map."}
                  </li>
                ) : (
                  spaces.map((space) => (
                    <li
                      key={space.id}
                      className="flex items-center justify-between gap-2 rounded-lg border px-3 py-2"
                    >
                      <button
                        type="button"
                        className="flex min-w-0 flex-1 items-start gap-2 text-left"
                        onClick={() => {
                          setListOpen(false);
                          onSelectSpace(space.id);
                        }}
                      >
                        <span
                          className="mt-1 size-3 shrink-0 rounded-sm ring-1 ring-black/20"
                          style={{ backgroundColor: USER_MAP_SPACE_COLOR_HEX }}
                          aria-hidden
                        />
                        <span className="min-w-0">
                          <span className="block truncate font-medium">
                            {space.name}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {space.infrastructureType ?? "Space"}
                            {space.acreage != null &&
                              ` · ${space.acreage.toFixed(2)} ac`}
                          </span>
                        </span>
                      </button>
                      {canEdit && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon-sm"
                          aria-label={`Manage ${space.name}`}
                          onClick={() => {
                            setListOpen(false);
                            onManageSpace(space);
                          }}
                        >
                          <Pencil className="size-4" />
                        </Button>
                      )}
                    </li>
                  ))
                )}
              </ul>
            </SheetContent>
          </Sheet>
        </div>
      )}
    </div>
  );
}
