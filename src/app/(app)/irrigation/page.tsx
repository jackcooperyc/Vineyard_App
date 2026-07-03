import { Suspense } from "react";
import Link from "next/link";
import { IrrigationViewBar } from "@/components/irrigation/irrigation-view-bar";
import { IrrigationFilterBar } from "@/components/irrigation/irrigation-filter-bar";
import { IrrigationStatsChips } from "@/components/irrigation/irrigation-stats-chips";
import { IrrigationEmptyState } from "@/components/irrigation/irrigation-empty-state";
import { IrrigationHubActions } from "@/components/irrigation/irrigation-hub-actions";
import { IrrigationRecordsHubBody } from "@/components/irrigation/irrigation-records-hub-body";
import { IrrigationSchedulesHubBody } from "@/components/irrigation/irrigation-schedules-hub-body";
import { IrrigationAlertsHubBody } from "@/components/irrigation/irrigation-alerts-hub-body";
import { Button } from "@/components/ui/button";
import { getBlockById } from "@/domains/blocks/queries";
import {
  irrigationFiltersAreActive,
  parseIrrigationActiveFilter,
  parseIrrigationRecordRange,
  parseIrrigationRecordStatus,
  parseIrrigationView,
} from "@/domains/irrigation/filters";
import {
  getIrrigationHubStats,
  getSchedulesWithDueHints,
  getIrrigationRecords,
  getIrrigationAlerts,
  getBlocksForIrrigationForm,
} from "@/domains/irrigation/queries";
import { countIrrigationPumps } from "@/domains/pumps/queries";
import {
  getRecentlyDeletedIrrigationRecords,
  getRecentlyDeletedIrrigationSchedules,
} from "@/domains/soft-delete/queries";
import { IrrigationRecentlyDeleted } from "@/components/irrigation/irrigation-recently-deleted";
import { irrigationHubParamsFromSearch } from "@/lib/hub-back-href";

export default async function IrrigationPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    blockId?: string;
    active?: string;
    range?: string;
    status?: string;
    q?: string;
  }>;
}) {
  const params = await searchParams;
  const view = parseIrrigationView(params.view);
  const blockId = params.blockId;
  const activeFilter = parseIrrigationActiveFilter(params.active);
  const recordRange = parseIrrigationRecordRange(params.range);
  const recordStatus = parseIrrigationRecordStatus(params.status);
  const scheduleSearch = params.q?.trim();
  const hasFilters = irrigationFiltersAreActive(params);
  const backParams = irrigationHubParamsFromSearch(params);

  const scheduleFilters = {
    blockId,
    activeOnly: activeFilter === "active" ? true : undefined,
    inactiveOnly: activeFilter === "inactive" ? true : undefined,
    search: view === "schedules" ? scheduleSearch : undefined,
  };

  const [stats, schedules, records, alerts, block, blocks, pumpCount, deletedRecords, deletedSchedules] =
    await Promise.all([
      getIrrigationHubStats(blockId),
      view === "schedules"
        ? getSchedulesWithDueHints(scheduleFilters)
        : Promise.resolve([]),
      view === "records"
        ? getIrrigationRecords({
            blockId,
            range: recordRange,
            status: recordStatus,
          })
        : Promise.resolve([]),
      view === "alerts" ? getIrrigationAlerts(blockId) : Promise.resolve([]),
      blockId ? getBlockById(blockId) : Promise.resolve(null),
      getBlocksForIrrigationForm(),
      countIrrigationPumps(),
      view === "deleted"
        ? getRecentlyDeletedIrrigationRecords(blockId)
        : Promise.resolve([]),
      view === "deleted"
        ? getRecentlyDeletedIrrigationSchedules(blockId)
        : Promise.resolve([]),
    ]);

  const blockFilter =
    block && blockId
      ? { id: block.id, code: block.code, name: block.name }
      : undefined;

  const filteredAlerts = alerts;

  const subtitle =
    view === "deleted"
      ? `${deletedRecords.length + deletedSchedules.length} recently deleted`
      : view === "schedules"
      ? `${schedules.length} schedule${schedules.length !== 1 ? "s" : ""}`
      : view === "records"
        ? `${records.length} record${records.length !== 1 ? "s" : ""}`
        : `${filteredAlerts.length} alert${filteredAlerts.length !== 1 ? "s" : ""}`;

  return (
    <div className="field-readable mx-auto max-w-3xl space-y-4 pb-32 md:space-y-6 md:pb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight">Irrigation</h2>
          <p className="text-muted-foreground">
            <span className="md:hidden">
              {subtitle}
              {blockFilter ? ` · ${blockFilter.code}` : ""}
            </span>
            <span className="hidden md:inline">
              {subtitle}
              {blockFilter
                ? ` · ${blockFilter.code} ${blockFilter.name}`
                : " · schedules, records, and alerts"}
            </span>
          </p>
          {pumpCount > 0 && (
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                render={<Link href="/pumps" />}
              >
                {pumpCount} pump{pumpCount !== 1 ? "s" : ""} on estate →
              </Button>
              <Button
                variant="link"
                className="h-auto p-0 text-sm"
                render={<Link href="/map" />}
              >
                View pumps on map →
              </Button>
            </div>
          )}
        </div>
        <IrrigationHubActions blocks={blocks} blockId={blockId} />
      </div>

      <IrrigationStatsChips stats={stats} blockId={blockId} />

      <Suspense
        fallback={<div className="h-11 animate-pulse rounded-full bg-muted" />}
      >
        <IrrigationViewBar />
      </Suspense>

      <Suspense fallback={null}>
        {view !== "deleted" && (
          <IrrigationFilterBar
            blockFilter={blockFilter}
            blocks={blocks}
            view={view}
          />
        )}
      </Suspense>

      {view === "deleted" && (
        <IrrigationRecentlyDeleted
          records={deletedRecords}
          schedules={deletedSchedules}
        />
      )}

      {view === "schedules" && (
        <IrrigationSchedulesHubBody
          schedules={schedules}
          backParams={backParams}
          emptyContext={{
            view: "schedules",
            hasFilters,
            blockId,
            blockCode: blockFilter?.code,
          }}
        />
      )}

      {view === "records" && (
        <IrrigationRecordsHubBody
          records={records}
          backParams={backParams}
          emptyContext={{
            view: "records",
            hasFilters,
            blockId,
            blockCode: blockFilter?.code,
          }}
        />
      )}

      {view === "alerts" &&
        (filteredAlerts.length === 0 ? (
          <IrrigationEmptyState
            context={{
              view: "alerts",
              hasFilters,
              blockId,
              blockCode: blockFilter?.code,
            }}
          />
        ) : (
          <IrrigationAlertsHubBody
            alerts={filteredAlerts}
            blockId={blockId}
            blockCode={blockFilter?.code}
          />
        ))}
    </div>
  );
}
