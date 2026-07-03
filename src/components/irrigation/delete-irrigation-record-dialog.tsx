"use client";

import { useRouter } from "next/navigation";
import { deleteIrrigationRecord } from "@/domains/irrigation/actions";
import { SoftDeleteSheet } from "@/components/soft-delete/soft-delete-sheet";
import { buildIrrigationHubHref } from "@/lib/hub-back-href";
import type { IrrigationHubParams } from "@/lib/hub-back-href";

export function DeleteIrrigationRecordDialog({
  recordId,
  backParams = {},
}: {
  recordId: string;
  backParams?: IrrigationHubParams;
}) {
  const router = useRouter();

  return (
    <SoftDeleteSheet
      title="Delete irrigation record?"
      triggerLabel="Delete record"
      onDelete={() => deleteIrrigationRecord(recordId)}
      onSuccess={() => {
        router.push(buildIrrigationHubHref({ ...backParams, view: "records" }));
      }}
    />
  );
}
