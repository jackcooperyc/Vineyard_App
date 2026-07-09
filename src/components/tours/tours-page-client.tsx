"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MapPin } from "lucide-react";
import { MapColorModeToggle } from "@/components/map/map-color-mode-toggle";
import { MapLegend } from "@/components/map/map-legend";
import { TourPOIFormSheet } from "@/components/tours/tour-poi-form-sheet";
import { TourPOIInfoOverlay } from "@/components/tours/tour-poi-info-overlay";
import { TourVineyardMap } from "@/components/tours/tour-vineyard-map";
import type { MapColorMode } from "@/domains/map/constants";
import type { MapBlockFeatureCollection } from "@/domains/map/types";
import { relocateTourPOI } from "@/domains/tours/actions";
import type { MapTourPOIGeo } from "@/domains/tours/map-geo";
import type { VarietyLegendItem } from "@/domains/varieties/queries";

type SheetState =
  | { kind: "closed" }
  | { kind: "create"; lat: number; lng: number }
  | { kind: "edit"; poi: MapTourPOIGeo }
  | { kind: "view"; poi: MapTourPOIGeo };

function resolveTourColorMode(colorParam: string | null): MapColorMode {
  if (colorParam === "status") return "status";
  if (colorParam === "varietal") return "varietal";
  return "tours";
}

export function ToursPageClient({
  geoJson,
  bounds,
  token,
  pois,
  varieties,
  canManage,
}: {
  geoJson: MapBlockFeatureCollection;
  bounds: [[number, number], [number, number]] | null;
  token: string;
  pois: MapTourPOIGeo[];
  varieties: VarietyLegendItem[];
  canManage: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();
  const [sheet, setSheet] = useState<SheetState>({ kind: "closed" });

  const colorMode = resolveTourColorMode(searchParams.get("color"));

  const selectedPoiId =
    sheet.kind === "edit" || sheet.kind === "view"
      ? sheet.poi.id
      : searchParams.get("poi") && pois.some((p) => p.id === searchParams.get("poi"))
        ? searchParams.get("poi")
        : null;

  const selectedPoi =
    selectedPoiId != null ? (pois.find((p) => p.id === selectedPoiId) ?? null) : null;

  const setColorMode = useCallback(
    (mode: MapColorMode) => {
      const params = new URLSearchParams(searchParams.toString());
      if (mode === "tours") {
        params.delete("color");
      } else {
        params.set("color", mode);
      }
      const query = params.toString();
      router.replace(query ? `/tours?${query}` : "/tours", { scroll: false });
    },
    [router, searchParams],
  );

  const replacePoiParam = useCallback(
    (poiId: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (poiId) {
        params.set("poi", poiId);
      } else {
        params.delete("poi");
      }
      const query = params.toString();
      router.replace(query ? `/tours?${query}` : "/tours", { scroll: false });
    },
    [router, searchParams],
  );

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

      replacePoiParam(poiId);

      if (colorMode === "tours") {
        setSheet({ kind: "closed" });
        return;
      }

      setSheet({ kind: canManage ? "edit" : "view", poi });
    },
    [pois, canManage, colorMode, replacePoiParam],
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

  const handleCloseSheet = useCallback(() => {
    setSheet({ kind: "closed" });
  }, []);

  const handleCloseOverlay = useCallback(() => {
    replacePoiParam(null);
    setSheet({ kind: "closed" });
  }, [replacePoiParam]);

  const handleEditFromOverlay = useCallback(() => {
    if (!selectedPoi) return;
    setSheet({ kind: "edit", poi: selectedPoi });
  }, [selectedPoi]);

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

  const showInfoOverlay =
    colorMode === "tours" && selectedPoi != null && sheet.kind === "closed";

  return (
    <>
      <div className="relative h-[calc(100dvh-12rem)] min-h-[400px] overflow-hidden rounded-lg border">
        <TourVineyardMap
          geoJson={geoJson}
          bounds={bounds}
          token={token}
          pois={pois}
          colorMode={colorMode}
          canManage={canManage}
          selectedPoiId={selectedPoiId}
          onMapClick={handleMapClick}
          onPoiSelect={handlePoiSelect}
          onPoiRelocate={handlePoiRelocate}
        />
        <div className="pointer-events-auto absolute top-3 right-3 z-10">
          <MapColorModeToggle
            mode={colorMode}
            onChange={setColorMode}
            includeTours
          />
        </div>
        {showInfoOverlay ? (
          <TourPOIInfoOverlay
            poi={selectedPoi}
            canManage={canManage}
            onClose={handleCloseOverlay}
            onEdit={handleEditFromOverlay}
          />
        ) : (
          <MapLegend
            colorMode={colorMode}
            varietyLegendItems={varieties}
            tourPois={pois}
            selectedTourPoiId={selectedPoiId}
            onTourPoiSelect={handlePoiSelect}
          />
        )}
        {canManage && colorMode === "tours" && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/50 to-transparent p-4">
            <p className="flex items-center gap-2 text-sm text-white">
              <MapPin className="size-4 shrink-0" />
              Tap the map to add a POI · Drag pins to move · Tap a pin for details
            </p>
          </div>
        )}
        {canManage && colorMode !== "tours" && (
          <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/40 to-transparent p-4">
            <p className="text-center text-xs text-white/90">
              Switch to <strong className="font-semibold">Tours</strong> to focus on
              tour points and pin details
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
        onClose={handleCloseSheet}
      />
    </>
  );
}
