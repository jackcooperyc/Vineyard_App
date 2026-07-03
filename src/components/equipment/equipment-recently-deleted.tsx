"use client";

import { restoreEquipment } from "@/domains/equipment/actions";
import { RecentlyDeletedPanel } from "@/components/soft-delete/recently-deleted-panel";
import { EQUIPMENT_STATUS_LABELS } from "@/domains/equipment/constants";
import type { RecentlyDeletedEquipment } from "@/domains/soft-delete/queries";

export function EquipmentRecentlyDeleted({
  items,
}: {
  items: RecentlyDeletedEquipment[];
}) {
  return (
    <RecentlyDeletedPanel
      items={items.map((item) => ({
        id: item.id,
        deletedAt: item.deletedAt,
        title: item.name,
        subtitle: [item.type, EQUIPMENT_STATUS_LABELS[item.status]]
          .filter(Boolean)
          .join(" · "),
        restore: () => restoreEquipment(item.id),
      }))}
      emptyMessage="No recently deleted equipment."
    />
  );
}
