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
    <div className={cn("flex items-center gap-2", className)}>
      <input
        ref={checkboxRef}
        type="checkbox"
        checked={allSelected}
        onChange={(e) => handleChange(e.target.checked)}
        aria-label={`${label} (${visibleCount})`}
        className="size-5 shrink-0 rounded border-input"
      />
      <button
        type="button"
        onClick={() => handleChange(!allSelected)}
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        {label} ({visibleCount})
      </button>
    </div>
  );
}
