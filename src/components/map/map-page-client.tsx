"use client";

import { useCallback, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { BlockMapDrawer } from "@/components/map/block-map-drawer";
import { MapLegend } from "@/components/map/map-legend";
import { MapViewToggle } from "@/components/map/map-view-toggle";
import { VineyardMap } from "@/components/map/vineyard-map";
import type { MapViewMode } from "@/domains/map/constants";
import type { MapBlock, MapBlockFeatureCollection } from "@/domains/map/types";

export function MapPageClient({
  blocks,
  geoJson,
  bounds,
  equipment,
  token,
}: {
  blocks: MapBlock[];
  geoJson: MapBlockFeatureCollection;
  bounds: [[number, number], [number, number]] | null;
  equipment: { id: string; name: string; type: string }[];
  token: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);

  const viewMode: MapViewMode =
    searchParams.get("view") === "3d" ? "3d" : "2d";

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

  const selectedBlock = blocks.find((block) => block.id === selectedBlockId) ?? null;

  return (
    <>
      <div className="relative h-[calc(100dvh-12rem)] min-h-[400px] overflow-hidden rounded-lg border">
        <VineyardMap
          blocks={blocks}
          geoJson={geoJson}
          bounds={bounds}
          token={token}
          viewMode={viewMode}
          onBlockSelect={setSelectedBlockId}
        />
        <MapViewToggle mode={viewMode} onChange={setViewMode} />
        <MapLegend className={viewMode === "3d" ? "bottom-14" : undefined} />
      </div>
      <BlockMapDrawer
        block={selectedBlock}
        equipment={equipment}
        onClose={() => setSelectedBlockId(null)}
      />
    </>
  );
}
