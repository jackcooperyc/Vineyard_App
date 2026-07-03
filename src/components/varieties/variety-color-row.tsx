"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateVarietyColor } from "@/domains/varieties/actions";
import type { VarietyColor } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

export type VarietyColorItem = {
  id: string;
  name: string;
  color: VarietyColor | null;
  colorHex: string | null;
  plantingCount?: number;
};

const WINE_TYPE_LABEL: Record<VarietyColor, string> = {
  RED: "Red",
  WHITE: "White",
  ROSE: "Rosé",
};

export function WineTypeBadge({ color }: { color: VarietyColor | null }) {
  if (!color) return null;
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide",
        color === "RED" && "bg-red-100 text-red-800",
        color === "WHITE" && "bg-amber-50 text-amber-900",
        color === "ROSE" && "bg-pink-100 text-pink-800",
      )}
    >
      {WINE_TYPE_LABEL[color]}
    </span>
  );
}

export function VarietyColorRow({
  variety,
  compact = false,
  showPlantingCount = true,
  hideHeader = false,
}: {
  variety: VarietyColorItem;
  compact?: boolean;
  showPlantingCount?: boolean;
  hideHeader?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [colorHex, setColorHex] = useState(variety.colorHex ?? "#6b7280");

  function handleSave() {
    setError(null);
    const formData = new FormData();
    formData.set("varietyId", variety.id);
    formData.set("colorHex", colorHex);

    startTransition(async () => {
      const result = await updateVarietyColor(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div
      className={cn(
        "flex flex-wrap items-center gap-3 rounded-lg border",
        compact ? "bg-muted/20 px-3 py-2" : "px-4 py-3",
      )}
    >
      {!hideHeader && (
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {!compact && (
              <span
                className="size-4 shrink-0 rounded border"
                style={{ backgroundColor: colorHex }}
                aria-hidden
              />
            )}
            <p className={cn("font-medium", compact && "text-sm")}>
              {variety.name}
            </p>
            <WineTypeBadge color={variety.color} />
          </div>
          {showPlantingCount && variety.plantingCount != null && (
            <p className="text-xs text-muted-foreground">
              {variety.plantingCount} planting
              {variety.plantingCount === 1 ? "" : "s"}
            </p>
          )}
          {compact && (
            <p className="text-xs text-muted-foreground">
              Estate-wide map color
            </p>
          )}
        </div>
      )}
      {hideHeader && (
        <p className="min-w-0 flex-1 text-xs text-muted-foreground">
          Map color (estate-wide)
        </p>
      )}
      <Input
        type="color"
        className={cn("shrink-0", compact ? "h-11 w-20" : "h-12 w-24")}
        value={colorHex}
        onChange={(e) => setColorHex(e.target.value)}
        aria-label={`Map color for ${variety.name}`}
      />
      <Button
        type="button"
        size={compact ? "sm" : "default"}
        className="min-h-11 shrink-0"
        disabled={pending}
        onClick={handleSave}
      >
        {pending ? "Saving…" : "Save"}
      </Button>
      {error && (
        <p className="w-full text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
