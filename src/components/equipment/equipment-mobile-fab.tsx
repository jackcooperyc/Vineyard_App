"use client";

import { EquipmentHubQuickLogSheet } from "@/components/equipment/equipment-hub-quick-log-sheet";

type EquipmentOption = { id: string; name: string; type: string };

export function EquipmentMobileFab({
  equipment,
}: {
  equipment: EquipmentOption[];
}) {
  return (
    <div className="fixed right-4 bottom-24 z-40 sm:hidden">
      <EquipmentHubQuickLogSheet equipment={equipment} />
    </div>
  );
}
