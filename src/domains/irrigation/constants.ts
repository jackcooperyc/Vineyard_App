import type { IrrigationStatus } from "@/generated/prisma/client";

export const IRRIGATION_STATUS_LABELS: Record<IrrigationStatus, string> = {
  SCHEDULED: "Scheduled",
  APPLIED: "Applied",
  MISSED: "Missed",
  SKIPPED: "Skipped",
};

export const IRRIGATION_METHODS = [
  "Drip",
  "Overhead",
  "Micro-sprinkler",
  "Furrow",
  "Other",
] as const;

export const IRRIGATION_FREQUENCIES = [
  { value: "daily", label: "Daily", days: 1 },
  { value: "weekly", label: "Weekly", days: 7 },
  { value: "biweekly", label: "Bi-weekly", days: 14 },
  { value: "monthly", label: "Monthly", days: 30 },
] as const;

export function frequencyToDays(frequency: string): number {
  const match = IRRIGATION_FREQUENCIES.find((f) => f.value === frequency);
  return match?.days ?? 7;
}
