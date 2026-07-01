"use client";

import { Layers2, Mountain } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MapViewMode } from "@/domains/map/constants";
import { cn } from "@/lib/utils";

export function MapViewToggle({
  mode,
  onChange,
  className,
}: {
  mode: MapViewMode;
  onChange: (mode: MapViewMode) => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto absolute top-3 right-3 z-10 flex rounded-full border bg-background/95 p-1 shadow-sm backdrop-blur-sm",
        className,
      )}
      role="group"
      aria-label="Map view mode"
    >
      <Button
        type="button"
        size="touch"
        variant={mode === "2d" ? "default" : "ghost"}
        className="h-11 min-h-11 rounded-full px-4"
        onClick={() => onChange("2d")}
        aria-pressed={mode === "2d"}
      >
        <Layers2 className="size-4" />
        2D
      </Button>
      <Button
        type="button"
        size="touch"
        variant={mode === "3d" ? "default" : "ghost"}
        className="h-11 min-h-11 rounded-full px-4"
        onClick={() => onChange("3d")}
        aria-pressed={mode === "3d"}
      >
        <Mountain className="size-4" />
        3D
      </Button>
    </div>
  );
}
