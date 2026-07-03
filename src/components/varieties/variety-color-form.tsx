"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateVarietyColor } from "@/domains/varieties/actions";
import type { VarietySettingsItem } from "@/domains/varieties/queries";
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

function VarietyColorRow({ variety }: { variety: VarietySettingsItem }) {
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
    <div className="flex flex-wrap items-center gap-3 rounded-lg border px-4 py-3">
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="font-medium">{variety.name}</p>
          <WineTypeBadge color={variety.color} />
        </div>
        <p className="text-xs text-muted-foreground">
          {variety.plantingCount} planting
          {variety.plantingCount === 1 ? "" : "s"}
        </p>
      </div>
      <Input
        type="color"
        className="h-12 w-24 shrink-0"
        value={colorHex}
        onChange={(e) => setColorHex(e.target.value)}
        aria-label={`Map color for ${variety.name}`}
      />
      <Button
        type="button"
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

export function VarietyColorForm({
  varieties,
}: {
  varieties: VarietySettingsItem[];
}) {
  if (varieties.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No varieties configured.</p>
    );
  }

  return (
    <div className="space-y-3">
      {varieties.map((variety) => (
        <VarietyColorRow key={variety.id} variety={variety} />
      ))}
    </div>
  );
}
