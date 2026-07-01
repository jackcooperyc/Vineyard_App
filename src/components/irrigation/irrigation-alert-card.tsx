import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { IRRIGATION_FREQUENCIES } from "@/domains/irrigation/constants";
import type { IrrigationAlert } from "@/domains/irrigation/queries";

function frequencyLabel(value: string) {
  return IRRIGATION_FREQUENCIES.find((f) => f.value === value)?.label ?? value;
}

export function IrrigationAlertCard({ alert }: { alert: IrrigationAlert }) {
  return (
    <Card className="border-red-200 bg-red-50/50 dark:border-red-900/50 dark:bg-red-950/20">
      <CardContent className="flex min-h-[72px] items-center gap-3 p-4">
        <AlertTriangle className="size-5 shrink-0 text-red-600" />
        <div className="flex-1 space-y-1">
          <p className="font-medium">
            {alert.block.code} · {alert.block.name}
          </p>
          <p className="text-sm text-muted-foreground">
            {frequencyLabel(alert.frequency)} schedule — no irrigation in{" "}
            {alert.daysSinceLast != null
              ? `${alert.daysSinceLast} days`
              : "recorded history"}
            {alert.expectedDays > 0 && ` (expected every ${alert.expectedDays} days)`}
          </p>
          {alert.lastAppliedAt && (
            <p className="text-xs text-muted-foreground">
              Last applied: {alert.lastAppliedAt.toLocaleDateString()}
            </p>
          )}
        </div>
        <Button
          variant="outline"
          size="sm"
          className="min-h-10 shrink-0"
          render={
            <Link
              href={`/irrigation/records/new?blockId=${alert.block.id}`}
            />
          }
        >
          Log
        </Button>
      </CardContent>
    </Card>
  );
}
