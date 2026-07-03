"use client";

import { useMemo, useState } from "react";
import { ListSelectAll } from "@/components/shared/list-select-all";
import { RecordListCard } from "@/components/irrigation/record-list-card";
import { IrrigationEmptyState } from "@/components/irrigation/irrigation-empty-state";
import { IrrigationRecordsBulkActionBar } from "@/components/irrigation/irrigation-records-bulk-action-bar";
import type { RecordListItem } from "@/domains/irrigation/queries";
import type { IrrigationHubParams } from "@/lib/hub-back-href";

export function IrrigationRecordsHubBody({
  records,
  emptyContext,
  backParams,
}: {
  records: RecordListItem[];
  emptyContext: {
    view: "records";
    hasFilters: boolean;
    blockId?: string;
    blockCode?: string;
  };
  backParams?: IrrigationHubParams;
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const selectedSet = useMemo(() => new Set(selectedIds), [selectedIds]);
  const visibleIds = useMemo(() => records.map((r) => r.id), [records]);
  const selectedVisibleCount = useMemo(
    () => visibleIds.filter((id) => selectedSet.has(id)).length,
    [visibleIds, selectedSet],
  );

  function toggleRecord(id: string, selected: boolean) {
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

  if (records.length === 0) {
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
        {records.map((record) => (
          <RecordListCard
            key={record.id}
            record={record}
            backParams={backParams}
            selectable
            selected={selectedSet.has(record.id)}
            onSelectedChange={(selected) => toggleRecord(record.id, selected)}
          />
        ))}
      </div>

      <IrrigationRecordsBulkActionBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
      />
    </>
  );
}
