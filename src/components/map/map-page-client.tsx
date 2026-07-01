"use client";

import { useState } from "react";
import { BlockMapDrawer } from "@/components/map/block-map-drawer";
import { MapLegend } from "@/components/map/map-legend";
import { VineyardMap } from "@/components/map/vineyard-map";
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
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const selectedBlock = blocks.find((block) => block.id === selectedBlockId) ?? null;

  return (
    <>
      <div className="relative h-[calc(100dvh-11rem)] min-h-[400px] overflow-hidden rounded-lg border">
        <VineyardMap
          blocks={blocks}
          geoJson={geoJson}
          bounds={bounds}
          token={token}
          onBlockSelect={setSelectedBlockId}
        />
        <MapLegend />
      </div>
      <BlockMapDrawer
        block={selectedBlock}
        equipment={equipment}
        onClose={() => setSelectedBlockId(null)}
      />
    </>
  );
}
