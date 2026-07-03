/** ISO date (YYYY-MM-DD) for CSV export filenames. */
export function csvExportDateStamp(): string {
  return new Date().toISOString().split("T")[0];
}

/** Builds a dated CSV filename, e.g. `cev-tasks-completed-90d-2026-07-03.csv`. */
export function buildCsvFilename(base: string): string {
  return `${base}-${csvExportDateStamp()}.csv`;
}

export function formatCsvDateValue(value: Date | string | null | undefined): string {
  if (!value) return "";
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
}

export function downloadCsv(filename: string, rows: string[][]) {
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
