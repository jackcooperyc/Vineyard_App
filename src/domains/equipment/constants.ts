import type { EquipmentStatus } from "@/generated/prisma/client";

export const EQUIPMENT_STATUS_LABELS: Record<EquipmentStatus, string> = {
  ACTIVE: "Active",
  IN_MAINTENANCE: "In maintenance",
  RETIRED: "Retired",
};

export const EQUIPMENT_STATUSES = Object.keys(
  EQUIPMENT_STATUS_LABELS,
) as EquipmentStatus[];

export const EQUIPMENT_TYPES = [
  "Tractor",
  "Sprayer",
  "Harvester",
  "ATV",
  "Pump",
  "Mower",
  "Other",
] as const;

export type EquipmentType = (typeof EQUIPMENT_TYPES)[number];
