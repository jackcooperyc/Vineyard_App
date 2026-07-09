import { Suspense } from "react";
import { MapPlaceholder } from "@/components/map/map-placeholder";
import { ToursPageClient } from "@/components/tours/tours-page-client";
import { getMapBlocks, getMapBounds, mapBlocksToGeoJSON } from "@/domains/map/queries";
import { getMapTourPOIs } from "@/domains/tours/queries";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/auth-session";
import { getVarietyLegendItems } from "@/domains/varieties/queries";
import { parseUserRole } from "@/lib/rbac";

export default async function ToursPage() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
  const session = await auth();
  const role = parseUserRole(session?.user?.role);
  const canManage = hasPermission(role, "tours:manage");

  const [blocks, pois, varieties] = await Promise.all([
    getMapBlocks(),
    getMapTourPOIs(),
    getVarietyLegendItems(),
  ]);

  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Tours</h2>
        <p className="text-muted-foreground">
          Vineyard tour points of interest · Red Mountain, Washington
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
          <ToursPageClient
            geoJson={mapBlocksToGeoJSON(blocks)}
            bounds={getMapBounds(blocks)}
            token={mapboxToken}
            pois={pois}
            varieties={varieties}
            canManage={canManage}
          />
        </Suspense>
      ) : (
        <MapPlaceholder blocks={blocks} />
      )}
    </div>
  );
}
