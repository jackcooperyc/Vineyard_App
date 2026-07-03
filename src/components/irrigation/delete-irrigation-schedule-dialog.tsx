"use client";

import { useRouter } from "next/navigation";
import { deleteIrrigationSchedule } from "@/domains/irrigation/actions";
import { SoftDeleteSheet } from "@/components/soft-delete/soft-delete-sheet";
import { buildIrrigationHubHref } from "@/lib/hub-back-href";
import type { IrrigationHubParams } from "@/lib/hub-back-href";

export function DeleteIrrigationScheduleDialog({
  scheduleId,
  backParams = {},
}: {
  scheduleId: string;
  backParams?: IrrigationHubParams;
}) {
  const router = useRouter();

  return (
    <SoftDeleteSheet
      title="Delete irrigation schedule?"
      triggerLabel="Delete schedule"
      onDelete={() => deleteIrrigationSchedule(scheduleId)}
      onSuccess={() => {
        router.push(
          buildIrrigationHubHref({ ...backParams, view: "schedules" }),
        );
      }}
    />
  );
}
