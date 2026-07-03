import Link from "next/link";
import { ChevronRight, ListTodo, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  EquipmentStatusBadge,
  ServiceDueBadge,
} from "@/components/equipment/equipment-status-badge";
import { EquipmentTypeIcon } from "@/components/equipment/equipment-type-icon";
import type { EquipmentListItem } from "@/domains/equipment/queries";
import { buildDetailHref } from "@/lib/hub-back-href";
import type { EquipmentHubParams } from "@/lib/hub-back-href";
import { cn } from "@/lib/utils";

export function EquipmentListCard({
  item,
  backParams,
}: {
  item: EquipmentListItem;
  backParams?: EquipmentHubParams;
}) {
  return (
    <Link
      href={buildDetailHref("/equipment", item.id, backParams)}
      className="block"
    >
      <Card className="field-tap transition-colors hover:bg-muted/40 active:bg-muted/60">
        <CardContent className="flex min-h-[80px] items-center gap-3 p-4">
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-full",
              item.status === "IN_MAINTENANCE"
                ? "bg-amber-50 dark:bg-amber-950/40"
                : item.status === "RETIRED"
                  ? "bg-muted"
                  : "bg-emerald-50 dark:bg-emerald-950/40",
            )}
          >
            <EquipmentTypeIcon
              type={item.type}
              className={cn(
                "size-5",
                item.status === "IN_MAINTENANCE"
                  ? "text-amber-600"
                  : item.status === "RETIRED"
                    ? "text-muted-foreground"
                    : "text-emerald-600 dark:text-emerald-400",
              )}
            />
          </div>
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {item.type}
              </span>
              <EquipmentStatusBadge status={item.status} />
              <ServiceDueBadge nextServiceAt={item.nextServiceAt} />
            </div>
            <p className="font-medium leading-tight">{item.name}</p>
            <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
              {item.serialNumber && <span>S/N {item.serialNumber}</span>}
              {item._count.tasks > 0 && (
                <span className="inline-flex items-center gap-1">
                  <ListTodo className="size-3.5" />
                  {item._count.tasks} open task{item._count.tasks !== 1 ? "s" : ""}
                </span>
              )}
              {item.lastServicedAt && (
                <span>
                  Last serviced {item.lastServicedAt.toLocaleDateString()}
                </span>
              )}
            </p>
          </div>
          {item.status === "IN_MAINTENANCE" ? (
            <Wrench className="size-5 shrink-0 text-amber-600" />
          ) : (
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
