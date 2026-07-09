"use client";

import { Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TourPOICategoryIcon } from "@/components/tours/tour-poi-icons";
import { TOUR_POI_CATEGORY_LABELS } from "@/domains/tours/constants";
import type { MapTourPOIGeo } from "@/domains/tours/map-geo";
import { cn } from "@/lib/utils";

export function TourPOIInfoOverlay({
  poi,
  canManage,
  onClose,
  onEdit,
  className,
}: {
  poi: MapTourPOIGeo;
  canManage: boolean;
  onClose: () => void;
  onEdit?: () => void;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "pointer-events-auto absolute bottom-3 left-3 z-10 w-72 max-w-[calc(100%-1.5rem)] rounded-lg border bg-background/95 shadow-sm backdrop-blur-sm",
        className,
      )}
      role="dialog"
      aria-label={`Tour point: ${poi.title}`}
    >
      <div className="flex items-start gap-2 border-b px-3 py-2">
        <TourPOICategoryIcon
          category={poi.category}
          className="mt-0.5 size-5 shrink-0 text-amber-600"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium text-muted-foreground">
            {TOUR_POI_CATEGORY_LABELS[poi.category]}
          </p>
          <p className="font-semibold leading-tight text-foreground">{poi.title}</p>
        </div>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8 shrink-0"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="size-4" />
        </Button>
      </div>
      <div className="space-y-2 px-3 py-2 text-sm">
        {poi.description ? (
          <p className="text-muted-foreground">{poi.description}</p>
        ) : (
          <p className="italic text-muted-foreground">No description yet.</p>
        )}
        <p className="text-xs text-muted-foreground">
          {poi.coordinates[1].toFixed(5)}, {poi.coordinates[0].toFixed(5)}
        </p>
        {canManage && onEdit ? (
          <Button type="button" variant="outline" size="sm" className="w-full" onClick={onEdit}>
            <Pencil className="size-3.5" />
            Edit point
          </Button>
        ) : null}
      </div>
    </div>
  );
}
