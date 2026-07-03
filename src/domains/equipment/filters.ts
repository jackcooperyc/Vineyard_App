import { EQUIPMENT_TYPES } from "@/domains/equipment/constants";
import type { EquipmentStatus } from "@/generated/prisma/client";

export function parseEquipmentStatusFilter(
  value: string | undefined,
): EquipmentStatus | "ALL" | "NEEDS_SERVICE" {
  if (!value || value === "ALL") return "ALL";
  if (value === "NEEDS_SERVICE") return "NEEDS_SERVICE";
  if (["ACTIVE", "IN_MAINTENANCE", "RETIRED"].includes(value)) {
    return value as EquipmentStatus;
  }
  return "ALL";
}

export function parseEquipmentTypeFilter(
  value: string | undefined,
): string | undefined {
  if (!value) return undefined;
  if (EQUIPMENT_TYPES.includes(value as (typeof EQUIPMENT_TYPES)[number])) {
    return value;
  }
  return undefined;
}

export function parseEquipmentDueFilter(
  value: string | undefined,
): "overdue" | "week" | "month" | undefined {
  if (value === "overdue" || value === "week" || value === "month") {
    return value;
  }
  return undefined;
}

export function parseEquipmentView(
  value: string | undefined,
): "list" | "calendar" | "deleted" {
  if (value === "calendar") return "calendar";
  if (value === "deleted") return "deleted";
  return "list";
}

export function equipmentFiltersAreActive(params: {
  status?: string;
  type?: string;
  q?: string;
  due?: string;
  view?: string;
}) {
  return Boolean(
    params.status ||
      params.type ||
      params.q ||
      params.due ||
      (params.view && params.view !== "list" && params.view !== "deleted"),
  );
}
