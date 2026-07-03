"use client";

import { useRouter } from "next/navigation";
import { deleteEquipment } from "@/domains/equipment/actions";
import { SoftDeleteSheet } from "@/components/soft-delete/soft-delete-sheet";
import { buildEquipmentHubHref } from "@/lib/hub-back-href";
import type { EquipmentHubParams } from "@/lib/hub-back-href";

export function DeleteEquipmentDialog({
  equipmentId,
  equipmentName,
  backParams = {},
}: {
  equipmentId: string;
  equipmentName: string;
  backParams?: EquipmentHubParams;
}) {
  const router = useRouter();

  return (
    <SoftDeleteSheet
      title={`Delete "${equipmentName}"?`}
      description="This equipment will be hidden from normal views. Open tasks will keep their equipment link. You can restore it within 48 hours from Recently deleted on the Equipment hub."
      triggerLabel="Delete equipment"
      variant="outline"
      onDelete={() => deleteEquipment(equipmentId)}
      onSuccess={() => {
        router.push(buildEquipmentHubHref(backParams));
      }}
    />
  );
}
