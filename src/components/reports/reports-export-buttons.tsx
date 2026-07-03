"use client";

import { Button } from "@/components/ui/button";
import type {
  EquipmentMaintenanceReportRow,
  IrrigationReportRow,
  OpenTasksByTypeReportRow,
  OverdueIrrigationReportRow,
  TaskReportRow,
} from "@/domains/reports/queries";

function downloadCsv(filename: string, rows: string[][]) {
  const csv = rows
    .map((row) =>
      row
        .map((cell) => {
          const escaped = String(cell).replace(/"/g, '""');
          return `"${escaped}"`;
        })
        .join(","),
    )
    .join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function ReportsExportButtons({
  tasks,
  irrigation,
  maintenance,
  overdueIrrigation,
  openTasksByType,
  periodDays,
}: {
  tasks: TaskReportRow[];
  irrigation: IrrigationReportRow[];
  maintenance: EquipmentMaintenanceReportRow[];
  overdueIrrigation: OverdueIrrigationReportRow[];
  openTasksByType: OpenTasksByTypeReportRow[];
  periodDays: number;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-10"
        onClick={() =>
          downloadCsv(`cev-tasks-completed-${periodDays}d.csv`, [
            ["Block code", "Block name", "Tasks completed"],
            ...tasks.map((row) => [
              row.blockCode,
              row.blockName,
              String(row.completedCount),
            ]),
          ])
        }
        disabled={tasks.length === 0}
      >
        Export tasks CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-10"
        onClick={() =>
          downloadCsv(`cev-irrigation-volume-${periodDays}d.csv`, [
            ["Block code", "Block name", "Record count", "Total volume (gal)"],
            ...irrigation.map((row) => [
              row.blockCode,
              row.blockName,
              String(row.recordCount),
              row.totalVolumeGal != null ? String(row.totalVolumeGal) : "",
            ]),
          ])
        }
        disabled={irrigation.length === 0}
      >
        Export irrigation CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-10"
        onClick={() =>
          downloadCsv(`cev-equipment-maintenance-${periodDays}d.csv`, [
            ["Equipment", "Type", "Records", "Last service"],
            ...maintenance.map((row) => [
              row.equipmentName,
              row.equipmentType,
              String(row.recordCount),
              row.lastPerformedAt?.toISOString().split("T")[0] ?? "",
            ]),
          ])
        }
        disabled={maintenance.length === 0}
      >
        Export maintenance CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-10"
        onClick={() =>
          downloadCsv("cev-overdue-irrigation.csv", [
            ["Block code", "Block name", "Days overdue", "Frequency"],
            ...overdueIrrigation.map((row) => [
              row.blockCode,
              row.blockName,
              String(row.daysOverdue),
              row.frequency,
            ]),
          ])
        }
        disabled={overdueIrrigation.length === 0}
      >
        Export overdue irrigation CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-10"
        onClick={() =>
          downloadCsv("cev-open-tasks-by-type.csv", [
            ["Task type", "Open count"],
            ...openTasksByType.map((row) => [row.type, String(row.openCount)]),
          ])
        }
        disabled={openTasksByType.length === 0}
      >
        Export open tasks CSV
      </Button>
    </div>
  );
}
