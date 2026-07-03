import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ReportsExportButtons } from "@/components/reports/reports-export-buttons";
import {
  getEquipmentMaintenanceReport,
  getIrrigationVolumeByBlockReport,
  getOpenTasksByTypeReport,
  getOverdueIrrigationReport,
  getGpsCoverageReport,
  getTasksCompletedByBlockReport,
  REPORT_PERIOD_DAYS,
} from "@/domains/reports/queries";

export default async function ReportsPage() {
  const [tasks, irrigation, maintenance, overdueIrrigation, openTasksByType, gpsCoverage] =
    await Promise.all([
      getTasksCompletedByBlockReport(),
      getIrrigationVolumeByBlockReport(),
      getEquipmentMaintenanceReport(),
      getOverdueIrrigationReport(),
      getOpenTasksByTypeReport(),
      getGpsCoverageReport(),
    ]);

  const taskTotal = tasks.reduce((sum, row) => sum + row.completedCount, 0);
  const irrigationTotal = irrigation.reduce(
    (sum, row) => sum + row.recordCount,
    0,
  );
  const maintenanceTotal = maintenance.reduce(
    (sum, row) => sum + row.recordCount,
    0,
  );
  const openTaskTotal = openTasksByType.reduce(
    (sum, row) => sum + row.openCount,
    0,
  );

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
        maintenance={maintenance}
        overdueIrrigation={overdueIrrigation}
        openTasksByType={openTasksByType}
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
            {irrigationTotal} applied record{irrigationTotal !== 1 ? "s" : ""}{" "}
            across {irrigation.length} block{irrigation.length !== 1 ? "s" : ""}
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

      <Card>
        <CardHeader>
          <CardTitle>Equipment maintenance</CardTitle>
          <CardDescription>
            {maintenanceTotal} service record{maintenanceTotal !== 1 ? "s" : ""}{" "}
            across {maintenance.length} asset
            {maintenance.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {maintenance.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No maintenance logged in the last {REPORT_PERIOD_DAYS} days.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Equipment</th>
                    <th className="pb-2 pr-4 font-medium text-right">Records</th>
                    <th className="pb-2 font-medium text-right">Last service</th>
                  </tr>
                </thead>
                <tbody>
                  {maintenance.map((row) => (
                    <tr key={row.equipmentId} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        {row.equipmentName}
                        <span className="text-muted-foreground">
                          {" "}
                          · {row.equipmentType}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums">
                        {row.recordCount}
                      </td>
                      <td className="py-2 text-right tabular-nums">
                        {row.lastPerformedAt?.toLocaleDateString() ?? "—"}
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
          <CardTitle>Overdue irrigation</CardTitle>
          <CardDescription>
            {overdueIrrigation.length} block
            {overdueIrrigation.length !== 1 ? "s" : ""} past schedule
          </CardDescription>
        </CardHeader>
        <CardContent>
          {overdueIrrigation.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No blocks currently overdue for irrigation.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Block</th>
                    <th className="pb-2 pr-4 font-medium text-right">
                      Days overdue
                    </th>
                    <th className="pb-2 font-medium">Frequency</th>
                  </tr>
                </thead>
                <tbody>
                  {overdueIrrigation.map((row) => (
                    <tr key={row.blockId} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        <span className="font-mono text-muted-foreground">
                          {row.blockCode}
                        </span>{" "}
                        {row.blockName}
                      </td>
                      <td className="py-2 pr-4 text-right tabular-nums">
                        {row.daysOverdue}
                      </td>
                      <td className="py-2">{row.frequency}</td>
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
          <CardTitle>GPS task coverage</CardTitle>
          <CardDescription>
            Block coverage from GPS-tracked field work (last {REPORT_PERIOD_DAYS} days + open)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {gpsCoverage.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No GPS coverage data yet. Start a session from Field log → Task → GPS track.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Block</th>
                    <th className="pb-2 pr-4 font-medium">Type</th>
                    <th className="pb-2 pr-4 font-medium">Worker</th>
                    <th className="pb-2 font-medium text-right">Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {gpsCoverage.map((row, i) => (
                    <tr key={`${row.blockId}-${i}`} className="border-b last:border-0">
                      <td className="py-2 pr-4">
                        <span className="font-mono text-muted-foreground">
                          {row.blockCode}
                        </span>{" "}
                        {row.blockName}
                      </td>
                      <td className="py-2 pr-4">{row.taskType}</td>
                      <td className="py-2 pr-4">{row.worker}</td>
                      <td className="py-2 text-right tabular-nums">
                        {row.coveragePct != null
                          ? `${Math.round(row.coveragePct)}%`
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

      <Card>
        <CardHeader>
          <CardTitle>Open tasks by type</CardTitle>
          <CardDescription>
            {openTaskTotal} open task{openTaskTotal !== 1 ? "s" : ""} across{" "}
            {openTasksByType.length} type
            {openTasksByType.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {openTasksByType.length === 0 ? (
            <p className="text-sm text-muted-foreground">No open tasks.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="pb-2 pr-4 font-medium">Type</th>
                    <th className="pb-2 font-medium text-right">Open</th>
                  </tr>
                </thead>
                <tbody>
                  {openTasksByType.map((row) => (
                    <tr key={row.type} className="border-b last:border-0">
                      <td className="py-2 pr-4">{row.type}</td>
                      <td className="py-2 text-right tabular-nums">
                        {row.openCount}
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
