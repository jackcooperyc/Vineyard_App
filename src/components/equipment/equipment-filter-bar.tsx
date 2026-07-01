"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import type { EquipmentStatus } from "@/generated/prisma/client";

const filters = [
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "IN_MAINTENANCE", label: "In maintenance" },
  { value: "NEEDS_SERVICE", label: "Needs service" },
  { value: "RETIRED", label: "Retired" },
] as const;

export function EquipmentFilterBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("status") ?? "ALL";

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
      {filters.map((filter) => {
        const params = new URLSearchParams(searchParams.toString());
        if (filter.value === "ALL") {
          params.delete("status");
        } else {
          params.set("status", filter.value);
        }
        const href = params.toString() ? `${pathname}?${params}` : pathname;
        const active =
          current === filter.value ||
          (filter.value === "ALL" && !searchParams.get("status"));

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

export function parseEquipmentStatusFilter(
  value: string | undefined,
): EquipmentStatus | "ALL" | "NEEDS_SERVICE" {
  if (!value || value === "ALL") return "ALL";
  if (value === "NEEDS_SERVICE") return "NEEDS_SERVICE";
  if (["ACTIVE", "IN_MAINTENANCE", "RETIRED"].includes(value)) {
    return value as EquipmentStatus;
  }
  return "ALL";
}
