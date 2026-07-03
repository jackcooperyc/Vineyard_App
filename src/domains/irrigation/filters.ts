import type { IrrigationRecordRange } from "@/domains/irrigation/queries";
import type { IrrigationStatus } from "@/generated/prisma/client";

export function parseIrrigationView(
  value: string | undefined,
): "schedules" | "records" | "alerts" | "deleted" {
  if (value === "records" || value === "alerts" || value === "deleted") {
    return value;
  }
  return "schedules";
}

export function parseIrrigationActiveFilter(
  value: string | undefined,
): "all" | "active" | "inactive" {
  if (value === "active" || value === "inactive") return value;
  return "all";
}

export function parseIrrigationRecordRange(
  value: string | undefined,
): IrrigationRecordRange | undefined {
  if (value === "week" || value === "month") return value;
  return undefined;
}

export function parseIrrigationRecordStatus(
  value: string | undefined,
): IrrigationStatus | undefined {
  if (
    value === "APPLIED" ||
    value === "SCHEDULED" ||
    value === "MISSED" ||
    value === "SKIPPED"
  ) {
    return value;
  }
  return undefined;
}

export function irrigationFiltersAreActive(params: {
  blockId?: string;
  active?: string;
  range?: string;
  view?: string;
  status?: string;
  q?: string;
}) {
  return Boolean(
    params.blockId || params.active || params.range || params.status || params.q,
  );
}
