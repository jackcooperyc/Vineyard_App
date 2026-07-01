"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { TASK_TYPES, TASK_TYPE_LABELS } from "@/domains/tasks/constants";
import type { TaskStatus, TaskType } from "@/generated/prisma/client";

const statusFilters = [
  { value: "OPEN", label: "Open" },
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
] as const;

type BlockFilter = { id: string; code: string; name: string };

function buildHref(
  pathname: string,
  searchParams: URLSearchParams,
  updates: Record<string, string | null>,
) {
  const params = new URLSearchParams(searchParams.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }
  return params.toString() ? `${pathname}?${params}` : pathname;
}

export function TaskFilterBar({ blockFilter }: { blockFilter?: BlockFilter }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") ?? "OPEN";
  const currentType = searchParams.get("type");

  return (
    <div className="space-y-2">
      {blockFilter && (
        <div className="flex items-center gap-2">
          <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 text-sm">
            <span className="font-mono text-xs text-muted-foreground">
              {blockFilter.code}
            </span>
            <span className="font-medium">{blockFilter.name}</span>
            <Link
              href={buildHref(pathname, searchParams, { blockId: null })}
              className="ml-1 flex size-6 items-center justify-center rounded-full hover:bg-muted"
              aria-label="Clear block filter"
            >
              <X className="size-3.5" />
            </Link>
          </span>
        </div>
      )}

      <div className="flex gap-2 overflow-x-auto pb-1">
        {statusFilters.map((filter) => {
          const href = buildHref(pathname, searchParams, {
            status: filter.value === "OPEN" ? null : filter.value,
          });
          const active =
            currentStatus === filter.value ||
            (filter.value === "OPEN" && !searchParams.get("status"));

          return (
            <Link
              key={filter.value}
              href={href}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              {filter.label}
            </Link>
          );
        })}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        <Link
          href={buildHref(pathname, searchParams, { type: null })}
          className={cn(
            "inline-flex min-h-9 shrink-0 items-center rounded-full border px-3 text-xs font-medium transition-colors",
            !currentType
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:bg-muted",
          )}
        >
          All types
        </Link>
        {TASK_TYPES.map((type) => {
          const href = buildHref(pathname, searchParams, { type });
          const active = currentType === type;

          return (
            <Link
              key={type}
              href={href}
              className={cn(
                "inline-flex min-h-9 shrink-0 items-center rounded-full border px-3 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              {TASK_TYPE_LABELS[type as TaskType]}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

export function parseTaskStatusFilter(
  value: string | undefined,
): TaskStatus | "ALL" | "OPEN" {
  if (!value || value === "OPEN") return "OPEN";
  if (value === "ALL") return "ALL";
  if (["PENDING", "IN_PROGRESS", "COMPLETED", "CANCELLED"].includes(value)) {
    return value as TaskStatus;
  }
  return "OPEN";
}

export function parseTaskTypeFilter(
  value: string | undefined,
): TaskType | undefined {
  if (!value) return undefined;
  if (TASK_TYPES.includes(value as TaskType)) {
    return value as TaskType;
  }
  return undefined;
}
