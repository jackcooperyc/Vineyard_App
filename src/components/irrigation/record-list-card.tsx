import Link from "next/link";
import { ChevronRight, Droplets } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { IrrigationStatusBadge } from "@/components/irrigation/irrigation-status-badge";
import type { RecordListItem } from "@/domains/irrigation/queries";

export function RecordListCard({ record }: { record: RecordListItem }) {
  return (
    <Link href={`/irrigation/records/${record.id}`} className="block">
      <Card className="transition-colors hover:bg-muted/40 active:bg-muted/60">
        <CardContent className="flex min-h-[72px] items-center gap-3 p-4">
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {record.block.code}
              </span>
              <IrrigationStatusBadge status={record.status} />
            </div>
            <p className="font-medium leading-tight">{record.block.name}</p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Droplets className="size-3.5" />
              {record.appliedAt.toLocaleDateString()}
              {record.method && ` · ${record.method}`}
              {record.volume != null && ` · ${record.volume} gal`}
              {record.duration != null && ` · ${record.duration} min`}
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
