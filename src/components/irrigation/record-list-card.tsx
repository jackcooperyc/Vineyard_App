import Link from "next/link";
import { ChevronRight, Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { IrrigationStatusBadge } from "@/components/irrigation/irrigation-status-badge";
import type { RecordListItem } from "@/domains/irrigation/queries";
import { buildDetailHref } from "@/lib/hub-back-href";
import type { IrrigationHubParams } from "@/lib/hub-back-href";
import { cn } from "@/lib/utils";

export function RecordListCard({
  record,
  backParams,
  selectable,
  selected,
  onSelectedChange,
}: {
  record: RecordListItem;
  backParams?: IrrigationHubParams;
  selectable?: boolean;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
}) {
  const card = (
    <Card
      className={cn(
        "field-tap transition-colors",
        !selectable && "hover:bg-muted/40 active:bg-muted/60",
        selectable && selected && "border-primary bg-primary/5",
      )}
    >
      <CardContent className="flex min-h-[72px] items-center gap-3 p-3 sm:min-h-[80px] sm:p-4">
        {selectable && (
          <input
            type="checkbox"
            checked={selected}
            onChange={(e) => onSelectedChange?.(e.target.checked)}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Select ${record.block.name} irrigation record`}
            className="size-6 shrink-0 rounded border-input touch-manipulation sm:size-5"
          />
        )}

        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-blue-50 dark:bg-blue-950/40">
          <Droplets className="size-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div className="flex-1 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">
              {record.block.code}
            </span>
            <IrrigationStatusBadge status={record.status} />
          </div>
          <p className="font-medium leading-tight">{record.block.name}</p>
          <p className="text-sm text-muted-foreground">
            {record.appliedAt.toLocaleDateString(undefined, {
              weekday: "short",
              month: "short",
              day: "numeric",
            })}
            {record.volume != null && (
              <span className="font-medium text-foreground">
                {" "}
                · {record.volume.toLocaleString()} gal
              </span>
            )}
            {record.method && ` · ${record.method}`}
            {record.duration != null && ` · ${record.duration} min`}
          </p>
        </div>
        {!selectable && (
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        )}
      </CardContent>
    </Card>
  );

  if (selectable) {
    return <div className="block">{card}</div>;
  }

  return (
    <Link
      href={buildDetailHref("/irrigation/records", record.id, backParams)}
      className="block touch-manipulation"
    >
      {card}
    </Link>
  );
}
