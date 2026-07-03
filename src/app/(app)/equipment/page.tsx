import { Suspense } from "react";
import { EquipmentFilterBar } from "@/components/equipment/equipment-filter-bar";
import { EquipmentStatsChips } from "@/components/equipment/equipment-stats-chips";
import { EquipmentEmptyState } from "@/components/equipment/equipment-empty-state";
import { EquipmentHubActions } from "@/components/equipment/equipment-hub-actions";
import { EquipmentListCard } from "@/components/equipment/equipment-list-card";
import { EquipmentRecentlyDeleted } from "@/components/equipment/equipment-recently-deleted";
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
import { getRecentlyDeletedEquipment } from "@/domains/soft-delete/queries";

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

  const [stats, items, equipmentForSelect, deletedEquipment] = await Promise.all([
    getEquipmentHubStats(),
    view === "deleted"
      ? Promise.resolve([])
      : getEquipment({
          status: statusFilter,
          type: typeFilter,
          search,
          due: dueFilter,
        }),
    getActiveEquipmentForSelect(),
    view === "deleted" ? getRecentlyDeletedEquipment() : Promise.resolve([]),
  ]);

  const statusLabel =
    statusFilter === "ALL"
      ? "all assets"
      : statusFilter === "NEEDS_SERVICE"
        ? "needs service"
        : statusFilter.toLowerCase().replace("_", " ");

  return (
    <div className="field-readable mx-auto max-w-3xl space-y-4 pb-32 md:space-y-6 md:pb-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="text-2xl font-semibold tracking-tight">Equipment</h2>
          <p className="text-muted-foreground">
            <span className="md:hidden">
              {view === "deleted"
                ? `${deletedEquipment.length} deleted`
                : `${items.length} asset${items.length !== 1 ? "s" : ""}`}
              {view !== "deleted" && hasFilters ? ` · filtered` : ""}
            </span>
            <span className="hidden md:inline">
              {view === "deleted"
                ? `${deletedEquipment.length} recently deleted`
                : `${items.length} asset${items.length !== 1 ? "s" : ""}`}
              {view !== "deleted" && hasFilters
                ? ` · ${statusLabel}`
                : view !== "deleted"
                  ? " · tractors, sprayers, and tools"
                  : ""}
            </span>
          </p>
        </div>
        <EquipmentHubActions equipment={equipmentForSelect} exportItems={items} />
      </div>

      <EquipmentStatsChips stats={stats} />

      <Suspense
        fallback={<div className="h-24 animate-pulse rounded-full bg-muted" />}
      >
        <EquipmentFilterBar />
      </Suspense>

      {view === "deleted" ? (
        <EquipmentRecentlyDeleted items={deletedEquipment} />
      ) : items.length === 0 ? (
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
