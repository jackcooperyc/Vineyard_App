"use client";

import {
  restoreIrrigationRecord,
  restoreIrrigationSchedule,
} from "@/domains/irrigation/actions";
import { RecentlyDeletedPanel } from "@/components/soft-delete/recently-deleted-panel";
import { IRRIGATION_FREQUENCIES } from "@/domains/irrigation/constants";
import type {
  RecentlyDeletedIrrigationRecord,
  RecentlyDeletedIrrigationSchedule,
} from "@/domains/soft-delete/queries";

function frequencyLabel(value: string) {
  return IRRIGATION_FREQUENCIES.find((f) => f.value === value)?.label ?? value;
}

export function IrrigationRecentlyDeleted({
  records,
  schedules,
}: {
  records: RecentlyDeletedIrrigationRecord[];
  schedules: RecentlyDeletedIrrigationSchedule[];
}) {
  const recordItems = records.map((item) => ({
    id: `record-${item.id}`,
    deletedAt: item.deletedAt,
    title: `Record · ${item.block.code}`,
    subtitle: [
      item.appliedAt.toLocaleDateString(),
      item.method,
      item.volume != null ? `${item.volume} gal` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    restore: () => restoreIrrigationRecord(item.id),
  }));

  const scheduleItems = schedules.map((item) => ({
    id: `schedule-${item.id}`,
    deletedAt: item.deletedAt,
    title: `Schedule · ${item.block.code}`,
    subtitle: frequencyLabel(item.frequency),
    restore: () => restoreIrrigationSchedule(item.id),
  }));

  const items = [...recordItems, ...scheduleItems].sort(
    (a, b) => b.deletedAt.getTime() - a.deletedAt.getTime(),
  );

  return (
    <RecentlyDeletedPanel
      items={items}
      emptyMessage="No recently deleted irrigation records or schedules."
    />
  );
}
