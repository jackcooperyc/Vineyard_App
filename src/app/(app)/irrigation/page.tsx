import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  IrrigationViewBar,
  parseIrrigationView,
} from "@/components/irrigation/irrigation-view-bar";
import { IrrigationFilterBar } from "@/components/irrigation/irrigation-filter-bar";
import { ScheduleListCard } from "@/components/irrigation/schedule-list-card";
import { RecordListCard } from "@/components/irrigation/record-list-card";
import { IrrigationAlertCard } from "@/components/irrigation/irrigation-alert-card";
import { getBlockById } from "@/domains/blocks/queries";
import {
  getIrrigationSchedules,
  getIrrigationRecords,
  getIrrigationAlerts,
} from "@/domains/irrigation/queries";

export default async function IrrigationPage({
  searchParams,
}: {
  searchParams: Promise<{ view?: string; blockId?: string }>;
}) {
  const params = await searchParams;
  const view = parseIrrigationView(params.view);
  const blockId = params.blockId;

  const [schedules, records, alerts, block] = await Promise.all([
    getIrrigationSchedules({ blockId }),
    getIrrigationRecords({ blockId }),
    getIrrigationAlerts(),
    blockId ? getBlockById(blockId) : Promise.resolve(null),
  ]);

  const blockFilter =
    block && blockId
      ? { id: block.id, code: block.code, name: block.name }
      : undefined;

  const filteredAlerts = blockId
    ? alerts.filter((alert) => alert.block.id === blockId)
    : alerts;

  const activeScheduleCount = schedules.filter((s) => s.active).length;
  const newScheduleHref = blockId
    ? `/irrigation/schedules/new?blockId=${blockId}`
    : "/irrigation/schedules/new";
  const newRecordHref = blockId
    ? `/irrigation/records/new?blockId=${blockId}`
    : "/irrigation/records/new";

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Irrigation</h2>
          <p className="text-muted-foreground">
            {activeScheduleCount} active schedule
            {activeScheduleCount !== 1 ? "s" : ""}
            {blockFilter
              ? ` · ${blockFilter.code} ${blockFilter.name}`
              : ` · ${filteredAlerts.length} alert${filteredAlerts.length !== 1 ? "s" : ""}`}
          </p>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button className="min-h-11 shrink-0 gap-2">
                <Plus className="size-4" />
                <span className="hidden sm:inline">Add</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href={newScheduleHref} />}>
              New schedule
            </DropdownMenuItem>
            <DropdownMenuItem render={<Link href={newRecordHref} />}>
              Log irrigation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <Suspense fallback={<div className="h-11 animate-pulse rounded-full bg-muted" />}>
        <IrrigationViewBar />
      </Suspense>

      <Suspense fallback={null}>
        <IrrigationFilterBar blockFilter={blockFilter} />
      </Suspense>

      {view === "schedules" && (
        <div className="space-y-3">
          {schedules.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No schedules yet.{" "}
              <Link
                href="/irrigation/schedules/new"
                className="text-primary underline-offset-4 hover:underline"
              >
                Create one
              </Link>
            </p>
          ) : (
            schedules.map((schedule) => (
              <ScheduleListCard key={schedule.id} schedule={schedule} />
            ))
          )}
        </div>
      )}

      {view === "records" && (
        <div className="space-y-3">
          {records.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No irrigation records yet.{" "}
              <Link
                href="/irrigation/records/new"
                className="text-primary underline-offset-4 hover:underline"
              >
                Log irrigation
              </Link>
            </p>
          ) : (
            records.map((record) => (
              <RecordListCard key={record.id} record={record} />
            ))
          )}
        </div>
      )}

      {view === "alerts" && (
        <div className="space-y-3">
          {filteredAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {blockFilter
                ? `No overdue irrigation for ${blockFilter.code}.`
                : "No overdue irrigation — all active schedules are up to date."}
            </p>
          ) : (
            filteredAlerts.map((alert) => (
              <IrrigationAlertCard key={alert.scheduleId} alert={alert} />
            ))
          )}
        </div>
      )}
    </div>
  );
}
