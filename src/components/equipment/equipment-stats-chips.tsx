import Link from "next/link";
import { cn } from "@/lib/utils";
import type { EquipmentHubStats } from "@/domains/equipment/queries";

type StatChip = {
  label: string;
  value: number;
  href: string;
  tone?: "default" | "danger" | "warning" | "success";
};

function chipToneClass(tone: StatChip["tone"]) {
  switch (tone) {
    case "danger":
      return "border-red-200 bg-red-50 text-red-900 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100";
    case "warning":
      return "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100";
    case "success":
      return "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100";
    default:
      return "border-border bg-muted/40 text-foreground";
  }
}

export function EquipmentStatsChips({ stats }: { stats: EquipmentHubStats }) {
  const chips: StatChip[] = [
    {
      label: "Operational",
      value: stats.operational,
      href: "/equipment?status=ACTIVE",
      tone: stats.operational > 0 ? "success" : "default",
    },
    {
      label: "Needs service",
      value: stats.needsService,
      href: "/equipment?status=NEEDS_SERVICE",
      tone: stats.needsService > 0 ? "danger" : "default",
    },
    {
      label: "In maintenance",
      value: stats.inMaintenance,
      href: "/equipment?status=IN_MAINTENANCE",
      tone: stats.inMaintenance > 0 ? "warning" : "default",
    },
    {
      label: "Retired",
      value: stats.retired,
      href: "/equipment?status=RETIRED",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
      {chips.map((chip) => (
        <Link
          key={chip.label}
          href={chip.href}
          className={cn(
            "field-tap flex min-h-14 flex-col justify-center rounded-xl border px-3 py-2 transition-colors hover:opacity-90 active:scale-[0.98]",
            chipToneClass(chip.tone),
          )}
        >
          <span className="text-2xl font-bold tabular-nums">{chip.value}</span>
          <span className="text-xs font-medium">{chip.label}</span>
        </Link>
      ))}
    </div>
  );
}
