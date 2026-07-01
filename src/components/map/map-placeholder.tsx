import { MapPin } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MapPlaceholder() {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="size-5 text-primary" />
          Vineyard map
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative flex aspect-[4/3] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 md:aspect-[16/9]">
          <div className="max-w-sm space-y-2 px-6 text-center">
            <p className="text-sm font-medium">2D map coming in Sprint 5</p>
            <p className="text-xs text-muted-foreground">
              Mapbox GL JS will render block polygons from{" "}
              <code className="rounded bg-muted px-1">MapFeature</code> records.
              Tap a block to open a slide-up drawer with quick actions.
            </p>
          </div>
          {/* Decorative block grid */}
          <div className="pointer-events-none absolute inset-4 grid grid-cols-4 grid-rows-3 gap-2 opacity-40">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="rounded border border-emerald-600/50 bg-emerald-500/20"
              />
            ))}
          </div>
        </div>
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>· Block boundaries stored as GeoJSON in the database</li>
          <li>· Shared dataset supports future 3D terrain view</li>
          <li>· Set NEXT_PUBLIC_MAPBOX_TOKEN when ready for live map</li>
        </ul>
      </CardContent>
    </Card>
  );
}
