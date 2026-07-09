"use client";

import { Grape, Layers, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MapColorMode } from "@/domains/map/constants";
import { cn } from "@/lib/utils";

export function MapColorModeToggle({
  mode,
  onChange,
  includeTours = false,
  className,
}: {
  mode: MapColorMode;
  onChange: (mode: MapColorMode) => void;
  /** When true, shows a third "Tours" overlay mode (e.g. on /tours). */
  includeTours?: boolean;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto flex rounded-full border bg-background/95 p-1 shadow-sm backdrop-blur-sm",
        className,
      )}
      role="group"
      aria-label="Map overlay mode"
    >
      <Button
        type="button"
        size="touch"
        variant={mode === "status" ? "default" : "ghost"}
        className="h-11 min-h-11 rounded-full px-4"
        onClick={() => onChange("status")}
        aria-pressed={mode === "status"}
      >
        <Layers className="size-4" />
        Status
      </Button>
      <Button
        type="button"
        size="touch"
        variant={mode === "varietal" ? "default" : "ghost"}
        className="h-11 min-h-11 rounded-full px-4"
        onClick={() => onChange("varietal")}
        aria-pressed={mode === "varietal"}
      >
        <Grape className="size-4" />
        Varietal
      </Button>
      {includeTours ? (
        <Button
          type="button"
          size="touch"
          variant={mode === "tours" ? "default" : "ghost"}
          className="h-11 min-h-11 rounded-full px-4"
          onClick={() => onChange("tours")}
          aria-pressed={mode === "tours"}
        >
          <MapPin className="size-4" />
          Tours
        </Button>
      ) : null}
    </div>
  );
}
