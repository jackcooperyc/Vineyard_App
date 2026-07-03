import Link from "next/link";
import { Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { ServiceDueBadge } from "@/components/equipment/equipment-status-badge";
import type { EquipmentListItem } from "@/domains/equipment/queries";

function weekKey(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  d.setDate(d.getDate() - day);
  return d.toISOString().split("T")[0];
}

function weekLabel(weekStart: string) {
  const start = new Date(weekStart);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
}

export function EquipmentServiceCalendar({
  items,
}: {
  items: EquipmentListItem[];
}) {
  const withDue = items.filter((item) => item.nextServiceAt != null);
  const noDue = items.filter((item) => item.nextServiceAt == null);

  const byWeek = new Map<string, EquipmentListItem[]>();
  for (const item of withDue) {
    const key = weekKey(item.nextServiceAt!);
    const list = byWeek.get(key) ?? [];
    list.push(item);
    byWeek.set(key, list);
  }

  const weeks = [...byWeek.entries()].sort(([a], [b]) => a.localeCompare(b));

  if (items.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No equipment matches the current filters.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      {weeks.map(([weekStart, weekItems]) => (
        <section key={weekStart} className="space-y-3">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Calendar className="size-4" />
            {weekLabel(weekStart)}
          </h3>
          <div className="space-y-2">
            {weekItems
              .sort(
                (a, b) =>
                  (a.nextServiceAt?.getTime() ?? 0) -
                  (b.nextServiceAt?.getTime() ?? 0),
              )
              .map((item) => (
                <Link key={item.id} href={`/equipment/${item.id}`} className="block">
                  <Card className="transition-colors hover:bg-muted/40">
                    <CardContent className="flex items-center justify-between gap-3 p-4">
                      <div>
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.type}
                          {item.serialNumber && ` · S/N ${item.serialNumber}`}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">
                          {item.nextServiceAt!.toLocaleDateString(undefined, {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          })}
                        </p>
                        <ServiceDueBadge nextServiceAt={item.nextServiceAt} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
          </div>
        </section>
      ))}

      {noDue.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground">
            No service date scheduled
          </h3>
          <div className="space-y-2">
            {noDue.map((item) => (
              <Link key={item.id} href={`/equipment/${item.id}`} className="block">
                <Card className="transition-colors hover:bg-muted/40">
                  <CardContent className="p-4">
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">{item.type}</p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
