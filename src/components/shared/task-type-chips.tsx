"use client";

import { TaskTypeIcon } from "@/components/tasks/task-type-icon";
import type { TaskTypeConfig } from "@/domains/tasks/types";
import { cn } from "@/lib/utils";

export function TaskTypeChips({
  types,
  value,
  onChange,
  onSelect,
  disabled,
  className,
}: {
  types: TaskTypeConfig[];
  value?: string;
  onChange?: (taskTypeId: string) => void;
  onSelect?: (taskTypeId: string) => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("grid grid-cols-2 gap-2 sm:grid-cols-3", className)}>
      {types.map((type) => {
        const selected = value === type.id;
        return (
          <button
            key={type.id}
            type="button"
            disabled={disabled}
            onClick={() => {
              onChange?.(type.id);
              onSelect?.(type.id);
            }}
            className={cn(
              "field-tap flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-sm font-medium transition-colors touch-manipulation",
              selected
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-muted active:bg-muted/80",
              disabled && "pointer-events-none opacity-50",
            )}
            style={
              !selected && type.colorHex
                ? { borderColor: `${type.colorHex}40` }
                : undefined
            }
          >
            <TaskTypeIcon
              iconName={type.iconName}
              className={cn("size-5", selected && "text-primary-foreground")}
            />
            {type.label}
          </button>
        );
      })}
    </div>
  );
}
