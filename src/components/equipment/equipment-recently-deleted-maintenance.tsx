"use client";

import { restoreMaintenanceRecord } from "@/domains/equipment/actions";
import { RecentlyDeletedPanel } from "@/components/soft-delete/recently-deleted-panel";
import type { RecentlyDeletedMaintenanceRecord } from "@/domains/soft-delete/queries";

export function EquipmentRecentlyDeletedMaintenance({
  items,
  equipmentId,
}: {
  items: RecentlyDeletedMaintenanceRecord[];
  equipmentId: string;
}) {
  return (
    <RecentlyDeletedPanel
      items={items.map((item) => ({
        id: item.id,
        deletedAt: item.deletedAt,
        title: item.description ?? "Maintenance service",
        subtitle: item.performedAt.toLocaleDateString(),
        restore: () => restoreMaintenanceRecord(item.id, equipmentId),
      }))}
      emptyMessage="No recently deleted maintenance records."
    />
  );
}
