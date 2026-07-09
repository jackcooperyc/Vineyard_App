import type { MapColorMode } from "@/domains/map/constants";
import { TourPOICategoryIcon } from "@/components/tours/tour-poi-icons";
import {
  TOUR_POI_CATEGORIES,
  TOUR_POI_CATEGORY_LABELS,
} from "@/domains/tours/constants";
import type { MapTourPOIGeo } from "@/domains/tours/map-geo";
import type { VarietyLegendItem } from "@/domains/varieties/queries";
import type { VarietyColor } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

const WINE_TYPE_LABEL: Record<VarietyColor, string> = {
  RED: "Red",
  WHITE: "White",
  ROSE: "Rosé",
};

function WineTypeBadge({ color }: { color: VarietyColor | null }) {
  if (!color) return null;
  return (
    <span
      className={cn(
        "rounded-full px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide",
        color === "RED" && "bg-red-100 text-red-800",
        color === "WHITE" && "bg-amber-50 text-amber-900",
        color === "ROSE" && "bg-pink-100 text-pink-800",
      )}
    >
      {WINE_TYPE_LABEL[color]}
    </span>
  );
}

function StatusLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-3 left-3 z-10 rounded-lg border bg-background/90 px-3 py-2 text-xs shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <p className="mb-1.5 font-medium text-foreground">Block status</p>
      <ul className="space-y-1 text-muted-foreground">
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-emerald-500/70 ring-1 ring-emerald-700" />
          Normal
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-amber-500/70 ring-1 ring-amber-700" />
          Open tasks
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-blue-500/70 ring-1 ring-blue-700" />
          Irrigation overdue
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-full bg-sky-500 ring-2 ring-white" />
          Irrigation pump
        </li>
        <li className="flex items-center gap-2">
          <span className="h-0.5 w-3 rounded bg-amber-500" />
          Active GPS track
        </li>
      </ul>
    </div>
  );
}

function VarietalLegend({
  items,
  className,
}: {
  items: VarietyLegendItem[];
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto absolute bottom-3 left-3 z-10 max-h-48 w-52 overflow-hidden rounded-lg border bg-background/90 text-xs shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <p className="border-b px-3 py-2 font-medium text-foreground">Varietals</p>
      <ul className="max-h-36 space-y-1 overflow-y-auto px-3 py-2 text-muted-foreground">
        {items.length === 0 ? (
          <li className="text-muted-foreground">No plantings</li>
        ) : (
          items.map((item) => (
            <li key={item.id} className="flex items-center gap-2">
              <span
                className="size-3 shrink-0 rounded-sm ring-1 ring-black/10"
                style={{ backgroundColor: item.colorHex }}
                aria-hidden
              />
              <span className="min-w-0 flex-1 truncate">{item.name}</span>
              <WineTypeBadge color={item.color} />
            </li>
          ))
        )}
        <li className="flex items-center gap-2 border-t pt-1">
          <span className="size-3 shrink-0 rounded-sm bg-gray-400 ring-1 ring-gray-600" />
          Infrastructure
        </li>
      </ul>
    </div>
  );
}

function ToursLegend({
  pois,
  selectedPoiId,
  onPoiSelect,
  className,
}: {
  pois: MapTourPOIGeo[];
  selectedPoiId?: string | null;
  onPoiSelect?: (poiId: string) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto absolute bottom-3 left-3 z-10 max-h-56 w-64 overflow-hidden rounded-lg border bg-background/90 text-xs shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <p className="border-b px-3 py-2 font-medium text-foreground">Tour points</p>
      {pois.length === 0 ? (
        <p className="px-3 py-2 text-muted-foreground">No points of interest yet.</p>
      ) : (
        <ul className="max-h-32 space-y-0.5 overflow-y-auto px-2 py-2">
          {pois.map((poi) => (
            <li key={poi.id}>
              <button
                type="button"
                onClick={() => onPoiSelect?.(poi.id)}
                className={cn(
                  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left transition-colors",
                  selectedPoiId === poi.id
                    ? "bg-amber-100 text-amber-950 dark:bg-amber-950/50 dark:text-amber-50"
                    : "text-muted-foreground hover:bg-muted/80 hover:text-foreground",
                )}
              >
                <TourPOICategoryIcon category={poi.category} className="size-4 shrink-0" />
                <span className="min-w-0 flex-1 truncate">{poi.title}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="border-t px-3 py-2">
        <p className="mb-1.5 font-medium text-foreground">Categories</p>
        <ul className="flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
          {TOUR_POI_CATEGORIES.map((category) => (
            <li key={category} className="inline-flex items-center gap-1">
              <TourPOICategoryIcon category={category} className="size-3.5" />
              <span className="truncate">{TOUR_POI_CATEGORY_LABELS[category]}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function MapLegend({
  colorMode,
  varietyLegendItems,
  tourPois,
  selectedTourPoiId,
  onTourPoiSelect,
  className,
}: {
  colorMode: MapColorMode;
  varietyLegendItems: VarietyLegendItem[];
  tourPois?: MapTourPOIGeo[];
  selectedTourPoiId?: string | null;
  onTourPoiSelect?: (poiId: string) => void;
  className?: string;
}) {
  if (colorMode === "tours") {
    return (
      <ToursLegend
        pois={tourPois ?? []}
        selectedPoiId={selectedTourPoiId}
        onPoiSelect={onTourPoiSelect}
        className={className}
      />
    );
  }
  if (colorMode === "varietal") {
    return <VarietalLegend items={varietyLegendItems} className={className} />;
  }
  return <StatusLegend className={className} />;
}
