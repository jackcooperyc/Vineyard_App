"use client";

import { Button } from "@/components/ui/button";
import type {
  IrrigationReportRow,
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
  periodDays,
}: {
  tasks: TaskReportRow[];
  irrigation: IrrigationReportRow[];
  periodDays: number;
}) {
  function exportTasks() {
    downloadCsv(`cev-tasks-completed-${periodDays}d.csv`, [
      ["Block code", "Block name", "Tasks completed"],
      ...tasks.map((row) => [
        row.blockCode,
        row.blockName,
        String(row.completedCount),
      ]),
    ]);
  }

  function exportIrrigation() {
    downloadCsv(`cev-irrigation-volume-${periodDays}d.csv`, [
      ["Block code", "Block name", "Record count", "Total volume (gal)"],
      ...irrigation.map((row) => [
        row.blockCode,
        row.blockName,
        String(row.recordCount),
        row.totalVolumeGal != null ? String(row.totalVolumeGal) : "",
      ]),
    ]);
  }

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-10"
        onClick={exportTasks}
        disabled={tasks.length === 0}
      >
        Export tasks CSV
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="min-h-10"
        onClick={exportIrrigation}
        disabled={irrigation.length === 0}
      >
        Export irrigation CSV
      </Button>
    </div>
  );
}
