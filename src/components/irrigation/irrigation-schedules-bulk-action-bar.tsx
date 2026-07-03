"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bulkToggleSchedulesActive } from "@/domains/irrigation/actions";

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
      onClear();
      router.refresh();
    });
  }

  if (selectedIds.length === 0) return null;

  const count = selectedIds.length;

  return (
    <div className="sticky bottom-4 z-20 rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-medium">
          {count} schedule{count !== 1 ? "s" : ""} selected
        </p>
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

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="default"
          size="sm"
          className="min-h-10"
          disabled={pending}
          onClick={() => applyActive(true)}
        >
          Activate selected
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-10"
          disabled={pending}
          onClick={() => applyActive(false)}
        >
          Deactivate selected
        </Button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
