import { MapPageClient } from "@/components/map/map-page-client";
import { MapPlaceholder } from "@/components/map/map-placeholder";
import { getActiveEquipmentForSelect } from "@/domains/equipment/queries";
import {
  getMapBlocks,
  getMapBounds,
  mapBlocksToGeoJSON,
} from "@/domains/map/queries";

export default async function MapPage() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
  const [blocks, equipment] = await Promise.all([
    getMapBlocks(),
    getActiveEquipmentForSelect(),
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Vineyard map</h2>
        <p className="text-muted-foreground">
          Interactive block map · Red Mountain, Washington
        </p>
      </div>

      {mapboxToken && blocks.length > 0 ? (
        <MapPageClient
          blocks={blocks}
          geoJson={mapBlocksToGeoJSON(blocks)}
          bounds={getMapBounds(blocks)}
          equipment={equipment}
          token={mapboxToken}
        />
      ) : (
        <MapPlaceholder blocks={blocks} />
      )}
    </div>
  );
}
