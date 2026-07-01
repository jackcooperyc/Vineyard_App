import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IRRIGATION_FREQUENCIES } from "@/domains/irrigation/constants";
import type { IrrigationAlert } from "@/domains/irrigation/queries";
import { cn } from "@/lib/utils";

function frequencyLabel(value: string) {
  return IRRIGATION_FREQUENCIES.find((f) => f.value === value)?.label ?? value;
}

function severity(daysSinceLast: number | null, expectedDays: number) {
  if (daysSinceLast == null) return "high";
  const overdueBy = daysSinceLast - expectedDays;
  if (overdueBy >= 7) return "critical";
  if (overdueBy >= 3) return "high";
  return "moderate";
}

export function IrrigationAlertCard({ alert }: { alert: IrrigationAlert }) {
  const level = severity(alert.daysSinceLast, alert.expectedDays);
  const overdueDays =
    alert.daysSinceLast != null
      ? Math.max(0, alert.daysSinceLast - alert.expectedDays)
      : null;

  return (
    <Card
      className={cn(
        "border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20",
        level === "critical" &&
          "border-red-400 bg-red-100/60 dark:border-red-700 dark:bg-red-950/40",
      )}
    >
      <CardContent className="flex min-h-[80px] flex-col gap-3 p-4 sm:flex-row sm:items-center">
        <div className="flex flex-1 items-start gap-3">
          <AlertTriangle
            className={cn(
              "size-5 shrink-0",
              level === "critical" ? "text-red-700" : "text-red-600",
            )}
          />
          <div className="flex-1 space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="border-red-300 bg-red-100 text-red-800 dark:border-red-800 dark:bg-red-950/60 dark:text-red-100"
              >
                {level === "critical" ? "Critical" : level === "high" ? "High" : "Moderate"}
              </Badge>
              <Badge variant="outline">{frequencyLabel(alert.frequency)}</Badge>
            </div>
            <p className="font-medium">
              <Link
                href={`/blocks/${alert.block.id}`}
                className="underline-offset-2 hover:underline"
              >
                {alert.block.code} · {alert.block.name}
              </Link>
            </p>
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="size-3.5" />
              {alert.daysSinceLast != null
                ? `No irrigation in ${alert.daysSinceLast} days`
                : "No irrigation recorded"}
              {alert.expectedDays > 0 &&
                ` (expected every ${alert.expectedDays} days)`}
              {overdueDays != null && overdueDays > 0 && (
                <span className="font-medium text-red-700 dark:text-red-300">
                  · {overdueDays} day{overdueDays !== 1 ? "s" : ""} overdue
                </span>
              )}
            </p>
            {alert.lastAppliedAt && (
              <p className="text-xs text-muted-foreground">
                Last applied: {alert.lastAppliedAt.toLocaleDateString()}
              </p>
            )}
          </div>
        </div>
        <div className="flex shrink-0 gap-2 sm:flex-col sm:gap-2 lg:flex-row">
          <Button
            variant="outline"
            size="sm"
            className="field-tap min-h-10 flex-1 sm:flex-none"
            render={
              <Link href={`/irrigation/schedules/${alert.scheduleId}`} />
            }
          >
            Schedule
          </Button>
          <Button
            size="sm"
            className="field-tap min-h-10 flex-1 sm:flex-none"
            render={
              <Link
                href={`/irrigation/records/new?blockId=${alert.block.id}`}
              />
            }
          >
            Log now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
