"use client";

import { useMemo, useState } from "react";
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

  function toggleRecord(id: string, selected: boolean) {
    setSelectedIds((prev) =>
      selected ? [...prev, id] : prev.filter((x) => x !== id),
    );
  }

  if (records.length === 0) {
    return <IrrigationEmptyState context={emptyContext} />;
  }

  return (
    <>
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
