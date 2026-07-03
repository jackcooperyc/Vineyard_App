"use client";

import { createElement } from "react";
import { cn } from "@/lib/utils";
import {
  TASK_TYPE_ICON_OPTIONS,
  resolveTaskTypeIcon,
} from "@/domains/tasks/type-icons";

export function TaskTypeIconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (iconName: string) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:grid-cols-7">
      {TASK_TYPE_ICON_OPTIONS.map((option) => {
        const Icon = option.icon;
        const selected = value === option.name;
        return (
          <button
            key={option.name}
            type="button"
            onClick={() => onChange(option.name)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-lg border p-2 text-xs transition-colors",
              selected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border hover:bg-muted",
            )}
            aria-pressed={selected}
            aria-label={option.label}
          >
            <Icon className="size-5" />
            <span className="truncate">{option.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export function TaskTypeIconPreview({ iconName }: { iconName: string }) {
  return createElement(resolveTaskTypeIcon(iconName), {
    className: "size-5",
    "aria-hidden": true,
  });
}
