"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Pencil } from "lucide-react";
import { deleteMapSpace } from "@/domains/map/actions";
import { USER_MAP_SPACE_COLOR_HEX } from "@/domains/map/constants";
import type { MapBlock } from "@/domains/map/types";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { MapSpaceFormSheet } from "@/components/map/map-space-form-sheet";
import { SoftDeleteSheet } from "@/components/soft-delete/soft-delete-sheet";

type MapSpaceManageSheetProps = {
  space: MapBlock | null;
  onClose: () => void;
  onRedraw: (space: MapBlock) => void;
};

export function MapSpaceManageSheet({
  space,
  onClose,
  onRedraw,
}: MapSpaceManageSheetProps) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [editOpen, setEditOpen] = useState(false);

  function handleClose() {
    setEditOpen(false);
    onClose();
  }

  return (
    <>
      <Sheet open={space != null && !editOpen} onOpenChange={(open) => !open && handleClose()}>
        <SheetContent side="bottom" className="max-h-[70dvh] overflow-y-auto">
          {space && (
            <>
              <SheetHeader>
                <div className="flex items-center gap-2 pr-8">
                  <span
                    className="size-3 shrink-0 rounded-sm ring-1 ring-black/20"
                    style={{ backgroundColor: USER_MAP_SPACE_COLOR_HEX }}
                    aria-hidden
                  />
                  <span className="font-mono text-sm text-muted-foreground">
                    {space.code}
                  </span>
                </div>
                <SheetTitle>{space.name}</SheetTitle>
                <SheetDescription>
                  {space.infrastructureType ?? "Custom space"}
                  {space.acreage != null && ` · ${space.acreage.toFixed(2)} ac`}
                </SheetDescription>
              </SheetHeader>

              <div className="flex flex-wrap gap-2 px-4 pb-4">
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  onClick={() => setEditOpen(true)}
                >
                  <Pencil className="size-4" />
                  Edit details
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="min-h-11"
                  onClick={() => onRedraw(space)}
                >
                  <MapPin className="size-4" />
                  Redraw boundary
                </Button>
                <SoftDeleteSheet
                  title={`Delete "${space.name}"?`}
                  description="This custom map space will be permanently removed."
                  triggerLabel="Delete space"
                  confirmLabel="Delete"
                  pendingLabel="Deleting…"
                  variant="outline"
                  onDelete={() => deleteMapSpace(space.id)}
                  onSuccess={() => {
                    handleClose();
                    startTransition(() => router.refresh());
                  }}
                />
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <MapSpaceFormSheet
        open={editOpen}
        mode="edit"
        geometry={null}
        blockId={space?.id}
        defaultName={space?.name ?? ""}
        defaultCategory={space?.infrastructureType ?? "Shop"}
        onClose={() => setEditOpen(false)}
        onSaved={() => handleClose()}
      />
    </>
  );
}
