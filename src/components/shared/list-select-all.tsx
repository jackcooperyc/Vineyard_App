"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

export function ListSelectAll({
  visibleCount,
  selectedCount,
  onSelectAll,
  onClearAll,
  label = "Select all",
  className,
}: {
  visibleCount: number;
  selectedCount: number;
  onSelectAll: () => void;
  onClearAll: () => void;
  label?: string;
  className?: string;
}) {
  const checkboxRef = useRef<HTMLInputElement>(null);
  const allSelected = visibleCount > 0 && selectedCount === visibleCount;
  const someSelected = selectedCount > 0 && selectedCount < visibleCount;

  useEffect(() => {
    if (checkboxRef.current) {
      checkboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  if (visibleCount === 0) return null;

  function handleChange(checked: boolean) {
    if (checked) {
      onSelectAll();
    } else {
      onClearAll();
    }
  }

  return (
    <div className={cn("flex min-h-11 items-center gap-3", className)}>
      <input
        ref={checkboxRef}
        type="checkbox"
        checked={allSelected}
        onChange={(e) => handleChange(e.target.checked)}
        aria-label={`${label} (${visibleCount})`}
        className="size-6 shrink-0 rounded border-input touch-manipulation sm:size-5"
      />
      <button
        type="button"
        onClick={() => handleChange(!allSelected)}
        className="min-h-11 flex-1 text-left text-sm text-muted-foreground hover:text-foreground touch-manipulation"
      >
        {label} ({visibleCount})
      </button>
    </div>
  );
}
