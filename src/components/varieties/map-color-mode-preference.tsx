"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateVineyardMapColorMode } from "@/domains/varieties/actions";
import type { MapColorMode } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

export function MapColorModePreference({
  currentMode,
}: {
  currentMode: MapColorMode;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleChange(mode: MapColorMode) {
    if (mode === currentMode) return;
    startTransition(async () => {
      await updateVineyardMapColorMode(mode);
      router.refresh();
    });
  }

  return (
    <div className="rounded-lg border bg-muted/30 p-4">
      <p className="text-sm font-medium">Default map color mode</p>
      <p className="mt-1 text-xs text-muted-foreground">
        Used when opening the map without a color URL parameter. You can still
        toggle Status or Varietal on the map itself.
      </p>
      <div className="mt-3 flex gap-2">
        {(["STATUS", "VARIETAL"] as const).map((mode) => (
          <Button
            key={mode}
            type="button"
            size="sm"
            variant={currentMode === mode ? "default" : "outline"}
            className={cn("min-h-10", pending && "opacity-70")}
            disabled={pending}
            onClick={() => handleChange(mode)}
          >
            {mode === "STATUS" ? "Status" : "Varietal"}
          </Button>
        ))}
      </div>
    </div>
  );
}
