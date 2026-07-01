import { MapPlaceholder } from "@/components/map/map-placeholder";

export default function MapPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Vineyard map</h2>
        <p className="text-muted-foreground">
          Interactive block map · Red Mountain, Washington
        </p>
      </div>
      <MapPlaceholder />
    </div>
  );
}
