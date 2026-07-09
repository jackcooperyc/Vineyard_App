"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { MapPin } from "lucide-react";
import { TourPOIFormSheet } from "@/components/tours/tour-poi-form-sheet";
import { TourPOICategoryIcon } from "@/components/tours/tour-poi-icons";
import { TourVineyardMap } from "@/components/tours/tour-vineyard-map";
import {
  TOUR_POI_CATEGORIES,
  TOUR_POI_CATEGORY_LABELS,
} from "@/domains/tours/constants";
import type { MapBlockFeatureCollection } from "@/domains/map/types";
import { relocateTourPOI } from "@/domains/tours/actions";
import type { MapTourPOIGeo } from "@/domains/tours/map-geo";

type SheetState =
  | { kind: "closed" }
  | { kind: "create"; lat: number; lng: number }
  | { kind: "edit"; poi: MapTourPOIGeo }
  | { kind: "view"; poi: MapTourPOIGeo };

export function ToursPageClient({
  geoJson,
  bounds,
  token,
  pois,
  canManage,
}: {
  geoJson: MapBlockFeatureCollection;
  bounds: [[number, number], [number, number]] | null;
  token: string;
  pois: MapTourPOIGeo[];
  canManage: boolean;
}) {
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [sheet, setSheet] = useState<SheetState>({ kind: "closed" });

  const selectedPoiId =
    sheet.kind === "edit" || sheet.kind === "view" ? sheet.poi.id : null;

  const handleMapClick = useCallback(
    (lat: number, lng: number) => {
      if (!canManage) return;
      setSheet({ kind: "create", lat, lng });
    },
    [canManage],
  );

  const handlePoiSelect = useCallback(
    (poiId: string) => {
      const poi = pois.find((p) => p.id === poiId);
      if (!poi) return;
      setSheet({ kind: canManage ? "edit" : "view", poi });
    },
    [pois, canManage],
  );

  const handlePoiRelocate = useCallback(
    (poiId: string, lat: number, lng: number) => {
      startTransition(async () => {
        const result = await relocateTourPOI(poiId, lat, lng);
        if (result.error) return;
        router.refresh();
      });
    },
    [router],
  );

  const handleClose = useCallback(() => {
    setSheet({ kind: "closed" });
  }, []);

  const sheetOpen = sheet.kind !== "closed";
  const sheetMode =
    sheet.kind === "create"
      ? "create"
      : sheet.kind === "edit"
        ? "edit"
        : sheet.kind === "view"
          ? "view"
          : "create";
  const sheetPoi =
    sheet.kind === "edit" || sheet.kind === "view" ? sheet.poi : null;
  const sheetLat =
    sheet.kind === "create"
      ? sheet.lat
      : sheetPoi
        ? sheetPoi.coordinates[1]
        : 0;
  const sheetLng =
    sheet.kind === "create"
      ? sheet.lng
      : sheetPoi
        ? sheetPoi.coordinates[0]
        : 0;

  return (
    <>
      <div className="relative h-[calc(100dvh-12rem)] min-h-[400px] overflow-hidden rounded-lg border">
        <TourVineyardMap
          geoJson={geoJson}
          bounds={bounds}
          token={token}
          pois={pois}
          canManage={canManage}
          selectedPoiId={selectedPoiId}
          onMapClick={handleMapClick}
          onPoiSelect={handlePoiSelect}
          onPoiRelocate={handlePoiRelocate}
        />
        {canManage && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
            <p className="flex items-center gap-2 text-sm text-white">
              <MapPin className="size-4 shrink-0" />
              Tap the map to add a POI · Drag pins to move · Tap a pin to edit
            </p>
          </div>
        )}
      </div>

      <TourPOIFormSheet
        key={`${sheetMode}-${sheetPoi?.id ?? "new"}-${sheetLat.toFixed(5)}-${sheetLng.toFixed(5)}`}
        open={sheetOpen}
        mode={sheetMode}
        poi={sheetPoi}
        lat={sheetLat}
        lng={sheetLng}
        canManage={canManage}
        onClose={handleClose}
      />

      {pois.length > 0 && (
        <div className="flex flex-wrap gap-x-4 gap-y-2 rounded-lg border bg-muted/30 px-4 py-3">
          <p className="w-full text-xs font-medium text-muted-foreground">
            Categories
          </p>
          {TOUR_POI_CATEGORIES.map((category) => (
            <span
              key={category}
              className="inline-flex items-center gap-1.5 text-xs text-muted-foreground"
            >
              <TourPOICategoryIcon category={category} className="size-4" />
              {TOUR_POI_CATEGORY_LABELS[category]}
            </span>
          ))}
        </div>
      )}

      {pois.length === 0 && !canManage && (
        <p className="text-center text-sm text-muted-foreground">
          No tour points of interest yet.
        </p>
      )}
    </>
  );
}
