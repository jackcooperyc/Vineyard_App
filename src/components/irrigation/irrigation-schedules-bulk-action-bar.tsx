"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { bulkToggleSchedulesActive } from "@/domains/irrigation/actions";
import { cn } from "@/lib/utils";

export function IrrigationSchedulesBulkActionBar({
  selectedIds,
  onClear,
}: {
  selectedIds: string[];
  onClear: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  function applyActive(active: boolean) {
    setError(null);
    startTransition(async () => {
      const result = await bulkToggleSchedulesActive({
        scheduleIds: selectedIds,
        active,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setSheetOpen(false);
      onClear();
      router.refresh();
    });
  }

  if (selectedIds.length === 0) return null;

  const count = selectedIds.length;
  const countLabel = `${count} schedule${count !== 1 ? "s" : ""} selected`;

  const actionButtons = (
    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <Button
        type="button"
        variant="default"
        className="min-h-11 w-full sm:min-h-10 sm:w-auto"
        disabled={pending}
        onClick={() => applyActive(true)}
      >
        Activate selected
      </Button>
      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full sm:min-h-10 sm:w-auto"
        disabled={pending}
        onClick={() => applyActive(false)}
      >
        Deactivate selected
      </Button>
    </div>
  );

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
              variant="outline"
              size="sm"
              className="min-h-10 gap-1.5 md:hidden"
              onClick={() => setSheetOpen(true)}
            >
              <SlidersHorizontal className="size-4" />
              Actions
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

        <div className="mt-3 hidden md:block">{actionButtons}</div>

        {error && (
          <p className="mt-2 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[50vh]">
          <SheetHeader>
            <SheetTitle>Bulk actions</SheetTitle>
            <SheetDescription>{countLabel}</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {actionButtons}
            {error && (
              <p className="mt-3 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
