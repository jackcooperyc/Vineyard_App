"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";

const views = [
  { value: "schedules", label: "Schedules" },
  { value: "records", label: "Records" },
  { value: "alerts", label: "Alerts" },
] as const;

export function IrrigationViewBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const current = searchParams.get("view") ?? "schedules";

  return (
    <div className="flex gap-2 overflow-x-auto pb-1">
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

        return (
          <Link
            key={view.value}
            href={href}
            className={cn(
              "inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            {view.label}
          </Link>
        );
      })}
    </div>
  );
}

export function parseIrrigationView(
  value: string | undefined,
): "schedules" | "records" | "alerts" {
  if (value === "records" || value === "alerts") return value;
  return "schedules";
}
