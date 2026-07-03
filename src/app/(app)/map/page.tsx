import { Suspense } from "react";
import { MapPageClient } from "@/components/map/map-page-client";
import { MapPlaceholder } from "@/components/map/map-placeholder";
import { getActiveEquipmentForSelect } from "@/domains/equipment/queries";
import { getMapBlocks, getMapBounds, mapBlocksToGeoJSON } from "@/domains/map/queries";
import { getMapPumps } from "@/domains/pumps/queries";
import { getActiveGpsTracksGeoJson } from "@/domains/task-gps/queries";
import { getQuickLogTaskTypes } from "@/domains/tasks/type-queries";
import { getCurrentWeather } from "@/domains/weather/queries";

export default async function MapPage() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
  const [blocks, equipment, pumps, gpsTracks, currentWeather, quickLogTypes] = await Promise.all([
    getMapBlocks(),
    getActiveEquipmentForSelect(),
    getMapPumps(),
    getActiveGpsTracksGeoJson(),
    getCurrentWeather(),
    getQuickLogTaskTypes(),
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
        <Suspense
          fallback={
            <div className="flex h-[calc(100dvh-12rem)] min-h-[400px] items-center justify-center rounded-lg border bg-muted/30 text-sm text-muted-foreground">
              Loading map…
            </div>
          }
        >
          <MapPageClient
            blocks={blocks}
            geoJson={mapBlocksToGeoJSON(blocks)}
            bounds={getMapBounds(blocks)}
            equipment={equipment}
            pumps={pumps}
            gpsTracks={gpsTracks}
            weather={currentWeather}
            quickLogTypes={quickLogTypes}
            token={mapboxToken}
          />
        </Suspense>
      ) : (
        <MapPlaceholder blocks={blocks} />
      )}
    </div>
  );
}
