import { Suspense } from "react";
import { EquipmentFilterBar } from "@/components/equipment/equipment-filter-bar";
import { EquipmentStatsChips } from "@/components/equipment/equipment-stats-chips";
import { EquipmentEmptyState } from "@/components/equipment/equipment-empty-state";
import { EquipmentHubActions } from "@/components/equipment/equipment-hub-actions";
import { EquipmentListCard } from "@/components/equipment/equipment-list-card";
import { EquipmentServiceCalendar } from "@/components/equipment/equipment-service-calendar";
import { EquipmentMobileFab } from "@/components/equipment/equipment-mobile-fab";
import {
  getActiveEquipmentForSelect,
  getEquipment,
  getEquipmentHubStats,
} from "@/domains/equipment/queries";
import {
  equipmentFiltersAreActive,
  parseEquipmentDueFilter,
  parseEquipmentStatusFilter,
  parseEquipmentTypeFilter,
  parseEquipmentView,
} from "@/domains/equipment/filters";
import { equipmentHubParamsFromSearch } from "@/lib/hub-back-href";

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{
    status?: string;
    type?: string;
    q?: string;
    due?: string;
    view?: string;
  }>;
}) {
  const params = await searchParams;
  const statusFilter = parseEquipmentStatusFilter(params.status);
  const typeFilter = parseEquipmentTypeFilter(params.type);
  const dueFilter = parseEquipmentDueFilter(params.due);
  const view = parseEquipmentView(params.view);
  const search = params.q?.trim();
  const hasFilters = equipmentFiltersAreActive(params);
  const backParams = equipmentHubParamsFromSearch(params);

  const [stats, items, equipmentForSelect] = await Promise.all([
    getEquipmentHubStats(),
    getEquipment({
      status: statusFilter,
      type: typeFilter,
      search,
      due: dueFilter,
    }),
    getActiveEquipmentForSelect(),
  ]);

  const statusLabel =
    statusFilter === "ALL"
      ? "all assets"
      : statusFilter === "NEEDS_SERVICE"
        ? "needs service"
        : statusFilter.toLowerCase().replace("_", " ");

  return (
    <div className="field-readable mx-auto max-w-3xl space-y-6 pb-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Equipment</h2>
          <p className="text-muted-foreground">
            {items.length} asset{items.length !== 1 ? "s" : ""}
            {hasFilters ? ` · ${statusLabel}` : " · tractors, sprayers, and tools"}
          </p>
        </div>
        <EquipmentHubActions equipment={equipmentForSelect} />
      </div>

      <EquipmentStatsChips stats={stats} />

      <Suspense
        fallback={<div className="h-24 animate-pulse rounded-full bg-muted" />}
      >
        <EquipmentFilterBar />
      </Suspense>

      {items.length === 0 ? (
        <EquipmentEmptyState
          context={{
            hasFilters,
            statusFilter: params.status,
            search,
            typeFilter,
          }}
        />
      ) : view === "calendar" ? (
        <EquipmentServiceCalendar items={items} />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <EquipmentListCard key={item.id} item={item} backParams={backParams} />
          ))}
        </div>
      )}

      <EquipmentMobileFab equipment={equipmentForSelect} />
    </div>
  );
}
