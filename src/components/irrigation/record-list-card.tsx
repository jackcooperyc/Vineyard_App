import Link from "next/link";
import { ChevronRight, Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { IrrigationStatusBadge } from "@/components/irrigation/irrigation-status-badge";
import type { RecordListItem } from "@/domains/irrigation/queries";

export function RecordListCard({ record }: { record: RecordListItem }) {
  return (
    <Link href={`/irrigation/records/${record.id}`} className="block">
      <Card className="field-tap transition-colors hover:bg-muted/40 active:bg-muted/60">
        <CardContent className="flex min-h-[80px] items-center gap-3 p-4">
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
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
