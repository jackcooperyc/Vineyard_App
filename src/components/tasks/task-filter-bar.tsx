"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { TaskStatus } from "@/generated/prisma/client";

const filters = [
  { value: "OPEN", label: "Open" },
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
] as const;

export function TaskFilterBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") ?? "OPEN";

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {filters.map((filter) => {
        const params = new URLSearchParams(searchParams.toString());
        if (filter.value === "OPEN") {
          params.delete("status");
        } else {
          params.set("status", filter.value);
        }
        const href = params.toString() ? `${pathname}?${params}` : pathname;
        const active =
          current === filter.value ||
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
