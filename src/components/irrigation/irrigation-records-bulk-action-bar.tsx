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
import { cn } from "@/lib/utils";

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
  const countLabel = `${count} record${count !== 1 ? "s" : ""} selected`;

  return (
    <>
      <div
        className={cn(
          "z-40 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur",
          "fixed inset-x-4 bottom-[5.75rem] md:sticky md:inset-x-auto md:bottom-4 md:p-4",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">{countLabel}</p>
          <div className="flex items-center gap-1">
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
              <span className="hidden sm:inline">Delete selected</span>
              <span className="sm:hidden">Delete</span>
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 touch-manipulation"
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
