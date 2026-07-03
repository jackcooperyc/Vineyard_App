import type { MapColorMode } from "@/domains/map/constants";
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

export function MapLegend({
  colorMode,
  varietyLegendItems,
  className,
}: {
  colorMode: MapColorMode;
  varietyLegendItems: VarietyLegendItem[];
  className?: string;
}) {
  if (colorMode === "varietal") {
    return <VarietalLegend items={varietyLegendItems} className={className} />;
  }
  return <StatusLegend className={className} />;
}
