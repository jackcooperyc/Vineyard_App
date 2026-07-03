"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { AlertTriangle, CalendarClock, Droplets, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const views = [
  { value: "schedules", label: "Schedules", shortLabel: "Schedules", icon: CalendarClock },
  { value: "records", label: "Records", shortLabel: "Records", icon: Droplets },
  { value: "alerts", label: "Alerts", shortLabel: "Alerts", icon: AlertTriangle },
  { value: "deleted", label: "Recently deleted", shortLabel: "Deleted", icon: Trash2 },
] as const;

export function IrrigationViewBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("view") ?? "schedules";

  return (
    <div className="flex gap-2">
      {views.map((view) => {
        const params = new URLSearchParams(searchParams.toString());
        if (view.value === "schedules") {
          params.delete("view");
        } else {
          params.set("view", view.value);
        }
        const href = params.toString() ? `${pathname}?${params}` : pathname;
        const active =
          current === view.value ||
          (view.value === "schedules" && !searchParams.get("view"));
        const Icon = view.icon;

        return (
          <Link
            key={view.value}
            href={href}
            className={cn(
              "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border px-3 text-sm font-medium transition-colors touch-manipulation sm:flex-none sm:px-4",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted",
              view.value === "alerts" &&
                !active &&
                "border-red-200 text-red-700 dark:border-red-900/50 dark:text-red-300",
            )}
          >
            <Icon className="size-4" />
            <span className="sm:hidden">{view.shortLabel}</span>
            <span className="hidden sm:inline">{view.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
