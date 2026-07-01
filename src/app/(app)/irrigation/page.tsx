import { Suspense } from "react";
import {
  IrrigationViewBar,
  parseIrrigationView,
} from "@/components/irrigation/irrigation-view-bar";
import {
  IrrigationFilterBar,
  parseIrrigationActiveFilter,
  parseIrrigationRecordRange,
  irrigationFiltersAreActive,
} from "@/components/irrigation/irrigation-filter-bar";
import { IrrigationStatsChips } from "@/components/irrigation/irrigation-stats-chips";
import { IrrigationEmptyState } from "@/components/irrigation/irrigation-empty-state";
import { IrrigationHubActions } from "@/components/irrigation/irrigation-hub-actions";
import { ScheduleListCard } from "@/components/irrigation/schedule-list-card";
import { RecordListCard } from "@/components/irrigation/record-list-card";
import { IrrigationAlertCard } from "@/components/irrigation/irrigation-alert-card";
import { getBlockById } from "@/domains/blocks/queries";
import {
  getIrrigationHubStats,
  getSchedulesWithDueHints,
  getIrrigationRecords,
  getIrrigationAlerts,
  getBlocksForIrrigationForm,
} from "@/domains/irrigation/queries";

export default async function IrrigationPage({
  searchParams,
}: {
  searchParams: Promise<{
    view?: string;
    blockId?: string;
    active?: string;
    range?: string;
  }>;
}) {
  const params = await searchParams;
  const view = parseIrrigationView(params.view);
  const blockId = params.blockId;
  const activeFilter = parseIrrigationActiveFilter(params.active);
  const recordRange = parseIrrigationRecordRange(params.range);
  const hasFilters = irrigationFiltersAreActive(params);

  const scheduleFilters = {
    blockId,
    activeOnly: activeFilter === "active" ? true : undefined,
    inactiveOnly: activeFilter === "inactive" ? true : undefined,
  };

  const [stats, schedules, records, alerts, block, blocks] = await Promise.all([
    getIrrigationHubStats(blockId),
    view === "schedules"
      ? getSchedulesWithDueHints(scheduleFilters)
      : Promise.resolve([]),
    view === "records"
      ? getIrrigationRecords({ blockId, range: recordRange })
      : Promise.resolve([]),
    view === "alerts" ? getIrrigationAlerts() : Promise.resolve([]),
    blockId ? getBlockById(blockId) : Promise.resolve(null),
    getBlocksForIrrigationForm(),
  ]);

  const blockFilter =
    block && blockId
      ? { id: block.id, code: block.code, name: block.name }
      : undefined;

  const filteredAlerts = blockId
    ? alerts.filter((alert) => alert.block.id === blockId)
    : alerts;

  const subtitle =
    view === "schedules"
      ? `${schedules.length} schedule${schedules.length !== 1 ? "s" : ""}`
      : view === "records"
        ? `${records.length} record${records.length !== 1 ? "s" : ""}`
        : `${filteredAlerts.length} alert${filteredAlerts.length !== 1 ? "s" : ""}`;

  return (
    <div className="field-readable mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Irrigation</h2>
          <p className="text-muted-foreground">
            {subtitle}
            {blockFilter
              ? ` · ${blockFilter.code} ${blockFilter.name}`
              : " · schedules, records, and alerts"}
          </p>
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
        <IrrigationFilterBar
          blockFilter={blockFilter}
          blocks={blocks}
          view={view}
        />
      </Suspense>

      {view === "schedules" &&
        (schedules.length === 0 ? (
          <IrrigationEmptyState
            context={{
              view: "schedules",
              hasFilters,
              blockId,
              blockCode: blockFilter?.code,
            }}
          />
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <ScheduleListCard key={schedule.id} schedule={schedule} />
            ))}
          </div>
        ))}

      {view === "records" &&
        (records.length === 0 ? (
          <IrrigationEmptyState
            context={{
              view: "records",
              hasFilters,
              blockId,
              blockCode: blockFilter?.code,
            }}
          />
        ) : (
          <div className="space-y-3">
            {records.map((record) => (
              <RecordListCard key={record.id} record={record} />
            ))}
          </div>
        ))}

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
          <div className="space-y-3">
            {filteredAlerts.map((alert) => (
              <IrrigationAlertCard key={alert.scheduleId} alert={alert} />
            ))}
          </div>
        ))}
    </div>
  );
}
