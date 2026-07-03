import type { IrrigationAlert } from "@/domains/irrigation/queries";

export function isIrrigationAlertDismissed(
  alertDismissedAt: Date | null,
  lastAppliedAt: Date | null,
): boolean {
  if (!alertDismissedAt) return false;
  if (!lastAppliedAt) return true;
  return lastAppliedAt.getTime() <= alertDismissedAt.getTime();
}

export type OverdueScheduleRow = {
  scheduleId: string;
  blockId: string;
  block: { id: string; code: string; name: string };
  frequency: string;
  alertDismissedAt: Date | null;
  lastAppliedAt: Date | null;
  daysSinceLast: number | null;
  expectedDays: number;
};

export function toIrrigationAlert(row: OverdueScheduleRow): IrrigationAlert {
  return {
    scheduleId: row.scheduleId,
    block: row.block,
    frequency: row.frequency,
    lastAppliedAt: row.lastAppliedAt,
    daysSinceLast: row.daysSinceLast,
    expectedDays: row.expectedDays,
  };
}
