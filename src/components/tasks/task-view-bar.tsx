"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { CalendarDays, List, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

const views = [
  { value: "timeline", label: "Timeline", icon: CalendarDays },
  { value: "list", label: "List", icon: List },
] as const;

export function TaskViewBar() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const trash = searchParams.get("trash");
  const current = trash ? "trash" : (searchParams.get("view") ?? "timeline");

  return (
    <div className="flex flex-wrap gap-2">
      {views.map((view) => {
        const params = new URLSearchParams(searchParams.toString());
        params.delete("trash");
        if (view.value === "timeline") {
          params.delete("view");
        } else {
          params.set("view", view.value);
        }
        const href = params.toString() ? `${pathname}?${params}` : pathname;
        const active = !trash && (
          current === view.value ||
          (view.value === "timeline" && !searchParams.get("view"))
        );
        const Icon = view.icon;

        return (
          <Link
            key={view.value}
            href={href}
            className={cn(
              "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors sm:flex-none",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            <Icon className="size-4" />
            {view.label}
          </Link>
        );
      })}
      <Link
        href={(() => {
          const params = new URLSearchParams(searchParams.toString());
          params.delete("view");
          params.set("trash", "1");
          return `${pathname}?${params}`;
        })()}
        className={cn(
          "inline-flex min-h-11 flex-1 items-center justify-center gap-2 rounded-full border px-4 text-sm font-medium transition-colors sm:flex-none",
          trash
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background text-muted-foreground hover:bg-muted",
        )}
      >
        <Trash2 className="size-4" />
        Recently deleted
      </Link>
    </div>
  );
}
