import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReportsExportButtons } from "@/components/reports/reports-export-buttons";
import {
  getIrrigationVolumeByBlockReport,
  getTasksCompletedByBlockReport,
  REPORT_PERIOD_DAYS,
} from "@/domains/reports/queries";

export default async function ReportsPage() {
  const [tasks, irrigation] = await Promise.all([
    getTasksCompletedByBlockReport(),
    getIrrigationVolumeByBlockReport(),
  ]);

  const taskTotal = tasks.reduce((sum, row) => sum + row.completedCount, 0);
  const irrigationTotal = irrigation.reduce((sum, row) => sum + row.recordCount, 0);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Reports</h2>
        <p className="text-muted-foreground">
          Operational summaries for the last {REPORT_PERIOD_DAYS} days
        </p>
      </div>

      <ReportsExportButtons
        tasks={tasks}
        irrigation={irrigation}
        periodDays={REPORT_PERIOD_DAYS}
      />

      <Card>
        <CardHeader>
          <CardTitle>Tasks completed by block</CardTitle>
          <CardDescription>
            {taskTotal} completed task{taskTotal !== 1 ? "s" : ""} across{" "}
            {tasks.length} block{tasks.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No completed tasks in the last {REPORT_PERIOD_DAYS} days.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Block</th>
                    <th className="pb-2 font-medium text-right">Completed</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((row) => (
                    <tr key={row.blockId} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        <span className="font-mono text-muted-foreground">
                          {row.blockCode}
                        </span>{" "}
                        {row.blockName}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {row.completedCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Irrigation by block</CardTitle>
          <CardDescription>
            {irrigationTotal} applied record{irrigationTotal !== 1 ? "s" : ""} across{" "}
            {irrigation.length} block{irrigation.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {irrigation.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No irrigation records in the last {REPORT_PERIOD_DAYS} days.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Block</th>
                    <th className="pb-2 pr-4 font-medium text-right">Records</th>
                    <th className="pb-2 font-medium text-right">Volume (gal)</th>
                  </tr>
                </thead>
                <tbody>
                  {irrigation.map((row) => (
                    <tr key={row.blockId} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        <span className="font-mono text-muted-foreground">
                          {row.blockCode}
                        </span>{" "}
                        {row.blockName}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums">
                        {row.recordCount}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {row.totalVolumeGal != null
                          ? row.totalVolumeGal.toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
