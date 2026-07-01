"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import type { MapBlock, MapBlockFeatureCollection } from "@/domains/map/types";

const SOURCE_ID = "blocks";
const FILL_LAYER_ID = "blocks-fill";
const OUTLINE_LAYER_ID = "blocks-outline";

type VineyardMapProps = {
  blocks: MapBlock[];
  geoJson: MapBlockFeatureCollection;
  bounds: [[number, number], [number, number]] | null;
  token: string;
  onBlockSelect: (blockId: string) => void;
};

export function VineyardMap({
  blocks,
  geoJson,
  bounds,
  token,
  onBlockSelect,
}: VineyardMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const onBlockSelectRef = useRef(onBlockSelect);

  useEffect(() => {
    onBlockSelectRef.current = onBlockSelect;
  }, [onBlockSelect]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const defaultCenter: [number, number] =
      blocks[0] != null
        ? [blocks[0].centerLng, blocks[0].centerLat]
        : [-119.328, 46.214];

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: defaultCenter,
      zoom: 14,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      map.addSource(SOURCE_ID, {
        type: "geojson",
        data: geoJson,
      });

      map.addLayer({
        id: FILL_LAYER_ID,
        type: "fill",
        source: SOURCE_ID,
        paint: {
          "fill-color": [
            "match",
            ["get", "overlay"],
            "irrigation",
            "#3b82f6",
            "tasks",
            "#f59e0b",
            "#22c55e",
          ],
          "fill-opacity": 0.45,
        },
      });

      map.addLayer({
        id: OUTLINE_LAYER_ID,
        type: "line",
        source: SOURCE_ID,
        paint: {
          "line-color": [
            "match",
            ["get", "overlay"],
            "irrigation",
            "#1d4ed8",
            "tasks",
            "#b45309",
            "#15803d",
          ],
          "line-width": 2,
        },
      });

      if (bounds) {
        map.fitBounds(bounds, { padding: 48, maxZoom: 16, duration: 0 });
      }
    });

    map.on("click", FILL_LAYER_ID, (event) => {
      const feature = event.features?.[0] as
        | { properties?: { blockId?: string } }
        | undefined;
      const blockId = feature?.properties?.blockId;
      if (typeof blockId === "string") {
        onBlockSelectRef.current(blockId);
      }
    });

    map.on("mouseenter", FILL_LAYER_ID, () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", FILL_LAYER_ID, () => {
      map.getCanvas().style.cursor = "";
    });

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [blocks, bounds, geoJson, token]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full"
      role="region"
      aria-label="Interactive vineyard block map"
    />
  );
}
