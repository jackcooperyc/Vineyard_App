"use client";

import { cn } from "@/lib/utils";
import { TASK_TYPE_LABELS, QUICK_LOG_TYPES } from "@/domains/tasks/constants";
import type { TaskType } from "@/generated/prisma/client";

export function TaskTypeChips({
  value,
  onChange,
  onSelect,
  disabled,
  className,
}: {
  value?: TaskType;
  onChange?: (type: TaskType) => void;
  onSelect?: (type: TaskType) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3", className)}>
      {QUICK_LOG_TYPES.map((type) => {
        const selected = value === type;
        return (
          <button
            key={type}
            type="button"
            disabled={disabled}
            onClick={() => {
              onChange?.(type);
              onSelect?.(type);
            }}
            className={cn(
              "field-tap rounded-xl border px-3 py-3 text-left text-sm font-medium transition-colors touch-manipulation",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted active:bg-muted/80",
              disabled && "pointer-events-none opacity-50",
            )}
          >
            {TASK_TYPE_LABELS[type]}
          </button>
        );
      })}
    </div>
  );
}
