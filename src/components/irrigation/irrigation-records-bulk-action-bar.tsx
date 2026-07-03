"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { bulkDeleteIrrigationRecords } from "@/domains/irrigation/actions";

export function IrrigationRecordsBulkActionBar({
  selectedIds,
  onClear,
}: {
  selectedIds: string[];
  onClear: () => void;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await bulkDeleteIrrigationRecords({
        recordIds: selectedIds,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setConfirmOpen(false);
      onClear();
      router.refresh();
    });
  }

  if (selectedIds.length === 0) return null;

  const count = selectedIds.length;

  return (
    <>
      <div className="sticky bottom-4 z-20 rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur">
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">
            {count} record{count !== 1 ? "s" : ""} selected
          </p>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="min-h-10 gap-2"
              disabled={pending}
              onClick={() => {
                setError(null);
                setConfirmOpen(true);
              }}
            >
              <Trash2 className="size-4" />
              Delete selected
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-8"
              onClick={onClear}
              aria-label="Clear selection"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>
        {error && !confirmOpen && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      <Sheet open={confirmOpen} onOpenChange={setConfirmOpen}>
        <SheetContent side="bottom" className="max-h-[50vh]">
          <SheetHeader>
            <SheetTitle>
              Delete {count} irrigation record{count !== 1 ? "s" : ""}?
            </SheetTitle>
            <SheetDescription>
              These records will be hidden from normal views. You can restore
              them within 48 hours from Recently deleted.
            </SheetDescription>
          </SheetHeader>
          {error && (
            <p className="px-4 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <SheetFooter className="flex-row gap-2">
            <Button
              variant="outline"
              className="min-h-11 flex-1"
              disabled={pending}
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              className="min-h-11 flex-1"
              disabled={pending}
              onClick={handleDelete}
            >
              {pending ? "Deleting…" : "Delete"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
