"use client";

import { Button } from "@/components/ui/button";
import type {
  EquipmentMaintenanceReportRow,
  IrrigationReportRow,
  OpenTasksByTypeReportRow,
  OverdueIrrigationReportRow,
  TaskReportRow,
} from "@/domains/reports/queries";
import { buildCsvFilename, downloadCsv, formatCsvDateValue } from "@/lib/csv-export";

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
          downloadCsv(buildCsvFilename(`cev-tasks-completed-${periodDays}d`), [
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
          downloadCsv(buildCsvFilename(`cev-irrigation-volume-${periodDays}d`), [
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
          downloadCsv(buildCsvFilename(`cev-equipment-maintenance-${periodDays}d`), [
            ["Equipment", "Type", "Records", "Last service"],
            ...maintenance.map((row) => [
              row.equipmentName,
              row.equipmentType,
              String(row.recordCount),
              formatCsvDateValue(row.lastPerformedAt),
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
          downloadCsv(buildCsvFilename("cev-overdue-irrigation"), [
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
          downloadCsv(buildCsvFilename("cev-open-tasks-by-type"), [
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
