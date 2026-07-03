"use client";

import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { EQUIPMENT_STATUS_LABELS } from "@/domains/equipment/constants";
import type { EquipmentListItem } from "@/domains/equipment/queries";
import {
  buildCsvFilename,
  downloadCsv,
  formatCsvDateValue,
} from "@/lib/csv-export";

type ExportableEquipment = Pick<
  EquipmentListItem,
  | "name"
  | "type"
  | "status"
  | "serialNumber"
  | "lastServicedAt"
  | "nextServiceAt"
>;

export function EquipmentExportButton({
  items,
  label = "Export CSV",
}: {
  items: ExportableEquipment[];
  label?: string;
}) {
  return (
    <Button
      type="button"
      variant="outline"
      className="min-h-11 gap-2"
      disabled={items.length === 0}
      onClick={() =>
        downloadCsv(buildCsvFilename("cev-equipment-list"), [
          [
            "Name",
            "Type",
            "Status",
            "Serial number",
            "Last serviced",
            "Next service due",
          ],
          ...items.map((item) => [
            item.name,
            item.type,
            EQUIPMENT_STATUS_LABELS[item.status],
            item.serialNumber ?? "",
            formatCsvDateValue(item.lastServicedAt),
            formatCsvDateValue(item.nextServiceAt),
          ]),
        ])
      }
    >
      <Download className="size-4" />
      {label}
    </Button>
  );
}
