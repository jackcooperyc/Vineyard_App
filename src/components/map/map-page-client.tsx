"use client";

import { useCallback, useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type mapboxgl from "mapbox-gl";
import { BlockMapDrawer } from "@/components/map/block-map-drawer";
import { MapColorModeToggle } from "@/components/map/map-color-mode-toggle";
import { MapDrawTool } from "@/components/map/map-draw-tool";
import { MapLegend } from "@/components/map/map-legend";
import { MapSpaceFormSheet } from "@/components/map/map-space-form-sheet";
import { MapSpaceManageSheet } from "@/components/map/map-space-manage-sheet";
import { MapSpacesToolbar } from "@/components/map/map-spaces-toolbar";
import { MapViewToggle } from "@/components/map/map-view-toggle";
import { PumpMapDrawer } from "@/components/map/pump-map-drawer";
import { VineyardMap } from "@/components/map/vineyard-map";
import { MapWeatherChip } from "@/components/weather/map-weather-chip";
import type { MapColorMode, MapViewMode } from "@/domains/map/constants";
import { getUserMapSpaces } from "@/domains/map/constants";
import type { MapBlock, MapBlockFeatureCollection, MapBlockGeometry } from "@/domains/map/types";
import {
  getPumpsForBlock,
  mapPumpsToGeoJSON,
  type MapPumpGeo,
} from "@/domains/pumps/map-geo";
import type { GpsTrackFeatureCollection } from "@/domains/task-gps/queries";
import type { TaskTypeConfig } from "@/domains/tasks/types";
import { updateVineyardMapColorMode } from "@/domains/varieties/actions";
import type { VarietyLegendItem } from "@/domains/varieties/queries";
import type { CurrentWeather } from "@/domains/weather/types";
import type { MapColorMode as PrismaMapColorMode } from "@/generated/prisma/client";

function resolveColorMode(
  colorParam: string | null,
  persistedMode: PrismaMapColorMode,
): MapColorMode {
  if (colorParam === "varietal") return "varietal";
  if (colorParam === "status") return "status";
  return persistedMode === "VARIETAL" ? "varietal" : "status";
}

export function MapPageClient({
  blocks,
  geoJson,
  bounds,
  equipment,
  pumps,
  gpsTracks,
  weather,
  quickLogTypes,
  varieties,
  defaultMapColorMode,
  token,
  canEditMapSpaces,
}: {
  blocks: MapBlock[];
  geoJson: MapBlockFeatureCollection;
  bounds: [[number, number], [number, number]] | null;
  equipment: { id: string; name: string; type: string }[];
  pumps: MapPumpGeo[];
  gpsTracks: GpsTrackFeatureCollection;
  weather: CurrentWeather;
  quickLogTypes: TaskTypeConfig[];
  varieties: VarietyLegendItem[];
  defaultMapColorMode: PrismaMapColorMode;
  token: string;
  canEditMapSpaces: boolean;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startPersistTransition] = useTransition();

  const [mapInstance, setMapInstance] = useState<mapboxgl.Map | null>(null);
  const [drawActive, setDrawActive] = useState(false);
  const [drawTarget, setDrawTarget] = useState<MapBlock | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formGeometry, setFormGeometry] = useState<MapBlockGeometry | null>(null);
  const [formBlockId, setFormBlockId] = useState<string | undefined>();
  const [formDefaults, setFormDefaults] = useState({ name: "", category: "Shop" });
  const [managingSpace, setManagingSpace] = useState<MapBlock | null>(null);

  const userMapSpaces = getUserMapSpaces(blocks);

  const pumpsGeoJson = mapPumpsToGeoJSON(pumps);

  const viewMode: MapViewMode =
    searchParams.get("view") === "3d" ? "3d" : "2d";

  const colorMode = resolveColorMode(
    searchParams.get("color"),
    defaultMapColorMode,
  );

  const pumpParam = searchParams.get("pump");
  const blockParam = searchParams.get("block");
  const selectedPumpId =
    pumpParam && pumps.some((p) => p.id === pumpParam) ? pumpParam : null;
  const selectedBlockId =
    !selectedPumpId && blockParam && blocks.some((b) => b.id === blockParam)
      ? blockParam
      : null;

  const setViewMode = useCallback(
    (mode: MapViewMode) => {
      const params = new URLSearchParams(searchParams.toString());
      if (mode === "3d") {
        params.set("view", "3d");
      } else {
        params.delete("view");
      }
      const query = params.toString();
      router.replace(query ? `/map?${query}` : "/map", { scroll: false });
    },
    [router, searchParams],
  );

  const setColorMode = useCallback(
    (mode: MapColorMode) => {
      const params = new URLSearchParams(searchParams.toString());
      if (mode === "varietal") {
        params.set("color", "varietal");
      } else {
        params.delete("color");
      }
      const query = params.toString();
      router.replace(query ? `/map?${query}` : "/map", { scroll: false });

      startPersistTransition(() => {
        void updateVineyardMapColorMode(
          mode === "varietal" ? "VARIETAL" : "STATUS",
        );
      });
    },
    [router, searchParams, startPersistTransition],
  );

  const replaceParams = useCallback(
    (mutate: (params: URLSearchParams) => void) => {
      const params = new URLSearchParams(searchParams.toString());
      mutate(params);
      const query = params.toString();
      router.replace(query ? `/map?${query}` : "/map", { scroll: false });
    },
    [router, searchParams],
  );

  const selectedBlock = blocks.find((block) => block.id === selectedBlockId) ?? null;
  const selectedPump = pumps.find((p) => p.id === selectedPumpId) ?? null;

  const highlightedBlockIds = selectedPump?.servicedBlockIds ?? [];
  const blockPumps = selectedBlockId
    ? getPumpsForBlock(pumps, selectedBlockId)
    : [];

  const servicedBlocks =
    selectedPump != null
      ? blocks
          .filter((b) => selectedPump.servicedBlockIds.includes(b.id))
          .map((b) => ({ id: b.id, code: b.code, name: b.name }))
      : [];

  function handleBlockSelect(blockId: string) {
    const block = blocks.find((item) => item.id === blockId);
    if (block && canEditMapSpaces && userMapSpaces.some((space) => space.id === blockId)) {
      setManagingSpace(block);
      return;
    }
    replaceParams((params) => {
      params.delete("pump");
      params.set("block", blockId);
    });
  }

  function handlePumpSelect(pumpId: string) {
    replaceParams((params) => {
      params.delete("block");
      params.set("pump", pumpId);
    });
  }

  function closeBlockDrawer() {
    replaceParams((params) => {
      params.delete("block");
    });
  }

  function closePumpDrawer() {
    replaceParams((params) => {
      params.delete("pump");
    });
  }

  const handleMapReady = useCallback((map: mapboxgl.Map) => {
    setMapInstance(map);
  }, []);

  function startCreateDraw() {
    setDrawTarget(null);
    setDrawActive(true);
    replaceParams((params) => {
      params.delete("block");
      params.delete("pump");
    });
  }

  function cancelDraw() {
    setDrawActive(false);
    setDrawTarget(null);
  }

  function handleDrawComplete(geometry: MapBlockGeometry) {
    setDrawActive(false);
    setFormGeometry(geometry);
    setFormMode(drawTarget ? "edit" : "create");
    setFormBlockId(drawTarget?.id);
    setFormDefaults({
      name: drawTarget?.name ?? "",
      category: drawTarget?.infrastructureType ?? "Shop",
    });
    setFormOpen(true);
    setDrawTarget(null);
  }

  function handleSelectSpace(blockId: string) {
    replaceParams((params) => {
      params.delete("pump");
      params.set("block", blockId);
    });
  }

  function handleRedrawSpace(space: MapBlock) {
    setManagingSpace(null);
    setDrawTarget(space);
    setDrawActive(true);
    replaceParams((params) => {
      params.delete("pump");
      params.delete("block");
    });
  }

  function closeForm() {
    setFormOpen(false);
    setFormGeometry(null);
    setFormBlockId(undefined);
  }

  const vineyardBlocks = blocks
    .filter((b) => b.blockType === "VINEYARD")
    .map((b) => ({ id: b.id, code: b.code, name: b.name }));

  return (
    <>
      <div className="relative h-[calc(100dvh-12rem)] min-h-[400px] overflow-hidden rounded-lg border">
        <VineyardMap
          blocks={blocks}
          geoJson={geoJson}
          pumpsGeoJson={pumpsGeoJson}
          gpsTracksGeoJson={gpsTracks}
          bounds={bounds}
          token={token}
          viewMode={viewMode}
          colorMode={colorMode}
          highlightedBlockIds={highlightedBlockIds}
          selectedPumpId={selectedPumpId}
          onBlockSelect={handleBlockSelect}
          onPumpSelect={handlePumpSelect}
          onMapReady={handleMapReady}
        />
        <MapDrawTool
          map={mapInstance}
          active={drawActive}
          initialGeometry={drawTarget?.geometry ?? null}
          onComplete={handleDrawComplete}
          onCancel={cancelDraw}
        />
        <MapSpacesToolbar
          spaces={userMapSpaces}
          canEdit={canEditMapSpaces}
          drawActive={drawActive}
          onStartDraw={startCreateDraw}
          onCancelDraw={cancelDraw}
          onSelectSpace={handleSelectSpace}
          onManageSpace={setManagingSpace}
        />
        <MapWeatherChip weather={weather} />
        <div className="pointer-events-auto absolute top-3 right-3 z-10 flex flex-col items-end gap-2">
          <MapColorModeToggle mode={colorMode} onChange={setColorMode} />
          <MapViewToggle mode={viewMode} onChange={setViewMode} className="static" />
        </div>
        <MapLegend
          colorMode={colorMode}
          varietyLegendItems={varieties}
          className={viewMode === "3d" ? "bottom-14" : undefined}
        />
      </div>
      <BlockMapDrawer
        block={selectedBlock}
        equipment={equipment}
        quickLogTypes={quickLogTypes}
        vineyardBlocks={vineyardBlocks}
        pumps={blockPumps}
        onClose={closeBlockDrawer}
      />
      <PumpMapDrawer
        pump={selectedPump}
        servicedBlocks={servicedBlocks}
        onClose={closePumpDrawer}
      />
      <MapSpaceFormSheet
        open={formOpen}
        mode={formMode}
        geometry={formGeometry}
        blockId={formBlockId}
        defaultName={formDefaults.name}
        defaultCategory={formDefaults.category}
        onClose={closeForm}
      />
      <MapSpaceManageSheet
        space={managingSpace}
        onClose={() => setManagingSpace(null)}
        onRedraw={handleRedrawSpace}
      />
    </>
  );
}
