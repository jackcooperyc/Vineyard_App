import Link from "next/link";
import { ChevronRight, Wrench } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import {
  EquipmentStatusBadge,
  ServiceDueBadge,
} from "@/components/equipment/equipment-status-badge";
import type { EquipmentListItem } from "@/domains/equipment/queries";

export function EquipmentListCard({ item }: { item: EquipmentListItem }) {
  return (
    <Link href={`/equipment/${item.id}`} className="block">
      <Card className="transition-colors hover:bg-muted/40 active:bg-muted/60">
        <CardContent className="flex min-h-[72px] items-center gap-3 p-4">
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {item.type}
              </span>
              <EquipmentStatusBadge status={item.status} />
              <ServiceDueBadge nextServiceAt={item.nextServiceAt} />
            </div>
            <p className="font-medium leading-tight">{item.name}</p>
            <p className="text-sm text-muted-foreground">
              {item.serialNumber && `S/N ${item.serialNumber} · `}
              {item._count.tasks} open task{item._count.tasks !== 1 ? "s" : ""}
              {item.lastServicedAt &&
                ` · Last serviced ${item.lastServicedAt.toLocaleDateString()}`}
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
