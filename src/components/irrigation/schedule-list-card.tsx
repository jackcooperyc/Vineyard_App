import Link from "next/link";
import { ChevronRight, Calendar, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScheduleActiveToggle } from "@/components/irrigation/schedule-active-toggle";
import { IRRIGATION_FREQUENCIES } from "@/domains/irrigation/constants";
import type { ScheduleWithDueHint } from "@/domains/irrigation/queries";
import { buildDetailHref } from "@/lib/hub-back-href";
import type { IrrigationHubParams } from "@/lib/hub-back-href";
import { cn } from "@/lib/utils";

function frequencyLabel(value: string) {
  return IRRIGATION_FREQUENCIES.find((f) => f.value === value)?.label ?? value;
}

function dueHint(schedule: ScheduleWithDueHint) {
  if (!schedule.active) return null;

  const expectedDays =
    IRRIGATION_FREQUENCIES.find((f) => f.value === schedule.frequency)?.days ?? 7;

  if (schedule.isOverdue) {
    const overdueBy =
      schedule.daysSinceLast != null
        ? schedule.daysSinceLast - expectedDays
        : null;
    return {
      text:
        overdueBy != null && overdueBy > 0
          ? `${overdueBy} day${overdueBy !== 1 ? "s" : ""} overdue`
          : "Overdue",
      tone: "danger" as const,
    };
  }

  if (schedule.daysSinceLast != null) {
    const daysUntil = expectedDays - schedule.daysSinceLast;
    if (daysUntil <= 3) {
      return {
        text: daysUntil <= 0 ? "Due now" : `Due in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`,
        tone: daysUntil <= 1 ? ("warning" as const) : ("default" as const),
      };
    }
  }

  return null;
}

export function ScheduleListCard({
  schedule,
  backParams,
  selectable,
  selected,
  onSelectedChange,
}: {
  schedule: ScheduleWithDueHint;
  backParams?: IrrigationHubParams;
  selectable?: boolean;
  selected?: boolean;
  onSelectedChange?: (selected: boolean) => void;
}) {
  const hint = dueHint(schedule);

  const card = (
    <Card
      className={cn(
        schedule.active ? "" : "opacity-60",
        schedule.isOverdue && schedule.active && "border-red-200 dark:border-red-900/50",
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
            aria-label={`Select ${schedule.block.name} irrigation schedule`}
            className="size-6 shrink-0 rounded border-input touch-manipulation sm:size-5"
          />
        )}

        <Link
          href={buildDetailHref("/irrigation/schedules", schedule.id, backParams)}
          className="field-tap flex flex-1 items-center gap-3 transition-colors hover:opacity-90"
        >
          <div className="flex-1 space-y-1.5">
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
              {hint && (
                <Badge
                  variant="outline"
                  className={cn(
                    hint.tone === "danger" &&
                      "border-red-300 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100",
                    hint.tone === "warning" &&
                      "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100",
                  )}
                >
                  <Clock className="mr-1 size-3" />
                  {hint.text}
                </Badge>
              )}
            </div>
            <p className="font-medium leading-tight">{schedule.block.name}</p>
            <p className="text-sm text-muted-foreground">
              {schedule.method && `${schedule.method} · `}
              {schedule.volume != null ? `${schedule.volume} gal` : "Volume not set"}
            </p>
            <p className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="size-3" />
              Started {schedule.startDate.toLocaleDateString()}
              {schedule.lastAppliedAt &&
                ` · Last applied ${schedule.lastAppliedAt.toLocaleDateString()}`}
            </p>
          </div>
          {!selectable && (
            <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
          )}
        </Link>
        <ScheduleActiveToggle scheduleId={schedule.id} active={schedule.active} />
      </CardContent>
    </Card>
  );

  if (selectable) {
    return <div className="block">{card}</div>;
  }

  return card;
}
