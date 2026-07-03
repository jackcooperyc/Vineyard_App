"use client";

import { useMemo, useState } from "react";
import { ListSelectAll } from "@/components/shared/list-select-all";
import { ScheduleListCard } from "@/components/irrigation/schedule-list-card";
import { IrrigationEmptyState } from "@/components/irrigation/irrigation-empty-state";
import { IrrigationSchedulesBulkActionBar } from "@/components/irrigation/irrigation-schedules-bulk-action-bar";
import type { ScheduleWithDueHint } from "@/domains/irrigation/queries";
import type { IrrigationHubParams } from "@/lib/hub-back-href";

export function IrrigationSchedulesHubBody({
  schedules,
  emptyContext,
  backParams,
}: {
  schedules: ScheduleWithDueHint[];
  emptyContext: {
    view: "schedules";
    hasFilters: boolean;
    blockId?: string;
    blockCode?: string;
  };
  backParams?: IrrigationHubParams;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const visibleIds = useMemo(() => schedules.map((s) => s.id), [schedules]);
  const selectedVisibleCount = useMemo(
    () => visibleIds.filter((id) => selectedSet.has(id)).length,
    [visibleIds, selectedSet],
  );

  function toggleSchedule(id: string, selected: boolean) {
    setSelectedIds((prev) =>
      selected ? [...prev, id] : prev.filter((x) => x !== id),
    );
  }

  function selectAllVisible() {
    setSelectedIds((prev) => [...new Set([...prev, ...visibleIds])]);
  }

  function clearVisibleSelection() {
    const visibleSet = new Set(visibleIds);
    setSelectedIds((prev) => prev.filter((id) => !visibleSet.has(id)));
  }

  if (schedules.length === 0) {
    return <IrrigationEmptyState context={emptyContext} />;
  }

  return (
    <>
      <ListSelectAll
        visibleCount={visibleIds.length}
        selectedCount={selectedVisibleCount}
        onSelectAll={selectAllVisible}
        onClearAll={clearVisibleSelection}
        className="pb-1"
      />
      <div className="space-y-3">
        {schedules.map((schedule) => (
          <ScheduleListCard
            key={schedule.id}
            schedule={schedule}
            backParams={backParams}
            selectable
            selected={selectedSet.has(schedule.id)}
            onSelectedChange={(selected) =>
              toggleSchedule(schedule.id, selected)
            }
          />
        ))}
      </div>

      <IrrigationSchedulesBulkActionBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
      />
    </>
  );
}
