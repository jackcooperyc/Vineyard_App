import Link from "next/link";
import { ChevronRight, Calendar } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScheduleActiveToggle } from "@/components/irrigation/schedule-active-toggle";
import { IRRIGATION_FREQUENCIES } from "@/domains/irrigation/constants";
import type { ScheduleListItem } from "@/domains/irrigation/queries";

function frequencyLabel(value: string) {
  return IRRIGATION_FREQUENCIES.find((f) => f.value === value)?.label ?? value;
}

export function ScheduleListCard({ schedule }: { schedule: ScheduleListItem }) {
  return (
    <Card className={schedule.active ? "" : "opacity-60"}>
      <CardContent className="flex min-h-[72px] items-center gap-3 p-4">
        <Link
          href={`/irrigation/schedules/${schedule.id}`}
          className="flex flex-1 items-center gap-3 transition-colors hover:opacity-90"
        >
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {schedule.block.code}
              </span>
              <Badge variant="outline">{frequencyLabel(schedule.frequency)}</Badge>
              {!schedule.active && (
                <Badge variant="outline" className="text-muted-foreground">
                  Inactive
                </Badge>
              )}
            </div>
            <p className="font-medium leading-tight">{schedule.block.name}</p>
            <p className="text-sm text-muted-foreground">
              {schedule.method && `${schedule.method} · `}
              {schedule.volume != null && `${schedule.volume} gal`}
              {schedule.volume == null && "Volume not set"}
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3" />
              Started {schedule.startDate.toLocaleDateString()}
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </Link>
        <ScheduleActiveToggle scheduleId={schedule.id} active={schedule.active} />
      </CardContent>
    </Card>
  );
}
