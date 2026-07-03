"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BlockMapDrawer } from "@/components/map/block-map-drawer";
import { MapLegend } from "@/components/map/map-legend";
import { MapViewToggle } from "@/components/map/map-view-toggle";
import { PumpMapDrawer } from "@/components/map/pump-map-drawer";
import { VineyardMap } from "@/components/map/vineyard-map";
import { MapWeatherChip } from "@/components/weather/map-weather-chip";
import type { MapViewMode } from "@/domains/map/constants";
import type { MapBlock, MapBlockFeatureCollection } from "@/domains/map/types";
import {
  getPumpsForBlock,
  mapPumpsToGeoJSON,
  type MapPumpGeo,
} from "@/domains/pumps/map-geo";
import type { GpsTrackFeatureCollection } from "@/domains/task-gps/queries";
import type { TaskTypeConfig } from "@/domains/tasks/types";
import type { CurrentWeather } from "@/domains/weather/types";

export function MapPageClient({
  blocks,
  geoJson,
  bounds,
  equipment,
  pumps,
  gpsTracks,
  weather,
  quickLogTypes,
  token,
}: {
  blocks: MapBlock[];
  geoJson: MapBlockFeatureCollection;
  bounds: [[number, number], [number, number]] | null;
  equipment: { id: string; name: string; type: string }[];
  pumps: MapPumpGeo[];
  gpsTracks: GpsTrackFeatureCollection;
  weather: CurrentWeather;
  quickLogTypes: TaskTypeConfig[];
  token: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const pumpsGeoJson = mapPumpsToGeoJSON(pumps);

  const viewMode: MapViewMode =
    searchParams.get("view") === "3d" ? "3d" : "2d";

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
          highlightedBlockIds={highlightedBlockIds}
          selectedPumpId={selectedPumpId}
          onBlockSelect={handleBlockSelect}
          onPumpSelect={handlePumpSelect}
        />
        <MapWeatherChip weather={weather} />
        <MapViewToggle mode={viewMode} onChange={setViewMode} className="top-14" />
        <MapLegend className={viewMode === "3d" ? "bottom-14" : undefined} />
      </div>
      <BlockMapDrawer
        block={selectedBlock}
        equipment={equipment}
        quickLogTypes={quickLogTypes}
        pumps={blockPumps}
        onClose={closeBlockDrawer}
      />
      <PumpMapDrawer
        pump={selectedPump}
        servicedBlocks={servicedBlocks}
        onClose={closePumpDrawer}
      />
    </>
  );
}
