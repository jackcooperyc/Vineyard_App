"use client";

import { deleteMaintenanceRecord } from "@/domains/equipment/actions";
import { SoftDeleteSheet } from "@/components/soft-delete/soft-delete-sheet";

export function DeleteMaintenanceRecordDialog({
  recordId,
  equipmentId,
  description,
}: {
  recordId: string;
  equipmentId: string;
  description?: string | null;
}) {
  const label = description?.trim() || "this maintenance record";

  return (
    <SoftDeleteSheet
      title={`Delete "${label}"?`}
      triggerLabel="Delete"
      variant="outline"
      onDelete={() => deleteMaintenanceRecord(recordId, equipmentId)}
    />
  );
}
