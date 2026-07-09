"use client";

import { useEffect, useRef } from "react";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import type mapboxgl from "mapbox-gl";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import { Button } from "@/components/ui/button";
import type { MapBlockGeometry } from "@/domains/map/types";

type MapDrawToolProps = {
  map: mapboxgl.Map | null;
  active: boolean;
  initialGeometry?: MapBlockGeometry | null;
  onComplete: (geometry: MapBlockGeometry) => void;
  onCancel: () => void;
};

function toMapBlockGeometry(feature: GeoJSON.Feature): MapBlockGeometry | null {
  if (feature.geometry.type !== "Polygon") return null;
  return {
    type: "Polygon",
    coordinates: feature.geometry.coordinates as number[][][],
  };
}

export function MapDrawTool({
  map,
  active,
  initialGeometry,
  onComplete,
  onCancel,
}: MapDrawToolProps) {
  const drawRef = useRef<MapboxDraw | null>(null);
  const onCompleteRef = useRef(onComplete);
  const onCancelRef = useRef(onCancel);
  const isRedraw = Boolean(initialGeometry);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    onCancelRef.current = onCancel;
  }, [onCancel]);

  useEffect(() => {
    if (!map || !active) return;

    const draw = new MapboxDraw({
      displayControlsDefault: false,
      controls: {
        polygon: !isRedraw,
        trash: true,
      },
      defaultMode: isRedraw ? "simple_select" : "draw_polygon",
    });

    map.addControl(draw as unknown as mapboxgl.IControl, "top-left");
    drawRef.current = draw;

    if (initialGeometry) {
      const ids = draw.add({
        type: "Feature",
        properties: {},
        geometry: initialGeometry,
      });
      if (ids.length > 0) {
        draw.changeMode("direct_select", { featureId: ids[0] });
      }
    } else {
      draw.changeMode("draw_polygon");
    }

    const handleCreate = (event: { features: GeoJSON.Feature[] }) => {
      if (isRedraw) return;
      const geometry = toMapBlockGeometry(event.features[0]);
      if (!geometry) return;
      onCompleteRef.current(geometry);
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onCancelRef.current();
      }
    };

    map.on("draw.create", handleCreate);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      map.off("draw.create", handleCreate);
      window.removeEventListener("keydown", handleKeyDown);
      if (drawRef.current) {
        map.removeControl(drawRef.current as unknown as mapboxgl.IControl);
        drawRef.current = null;
      }
    };
  }, [map, active, initialGeometry, isRedraw]);

  function handleSaveBoundary() {
    const draw = drawRef.current;
    if (!draw) return;
    const collection = draw.getAll();
    const feature = collection.features[0];
    if (!feature) return;
    const geometry = toMapBlockGeometry(feature);
    if (!geometry) return;
    onCompleteRef.current(geometry);
  }

  if (!active) return null;

  return isRedraw ? (
    <div className="pointer-events-auto absolute top-28 left-14 z-10 max-w-xs rounded-lg border bg-background/95 p-3 shadow-md backdrop-blur sm:left-16">
      <p className="text-sm font-medium">Adjust the boundary</p>
      <p className="mb-3 text-xs text-muted-foreground">
        Drag vertices to reshape the polygon, then save.
      </p>
      <div className="flex gap-2">
        <Button type="button" size="sm" className="min-h-9 flex-1" onClick={handleSaveBoundary}>
          Save boundary
        </Button>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-9"
          onClick={() => onCancelRef.current()}
        >
          Cancel
        </Button>
      </div>
    </div>
  ) : null;
}
