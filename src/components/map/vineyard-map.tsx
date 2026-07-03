"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import type { ExpressionSpecification } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import {
  ESTATE_CENTER,
  MAP_3D_BEARING,
  MAP_3D_PITCH,
  TERRAIN_EXAGGERATION,
  type MapViewMode,
} from "@/domains/map/constants";
import type { MapBlock, MapBlockFeatureCollection } from "@/domains/map/types";
import {
  BLOCK_LAYER_IDS,
  EXTRUSION_LAYER_ID,
  FILL_LAYER_ID,
  MAP_SOURCE_ID,
  OUTLINE_LAYER_ID,
  PUMP_LAYER_ID,
  PUMP_SOURCE_ID,
  GPS_TRACK_LAYER_ID,
  GPS_TRACK_SOURCE_ID,
  TERRAIN_SOURCE_ID,
  blockExtrusionHeight,
  blockFillColor,
  blockOutlineColor,
  extrusionBaseHeight,
} from "@/lib/maps/layers";

type PumpFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id: string;
    geometry: { type: "Point"; coordinates: [number, number] };
    properties: {
      pumpId: string;
      name: string;
      servicedBlockIds: string[];
    };
  }>;
};

type GpsTrackFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    geometry: { type: "LineString"; coordinates: [number, number][] };
    properties: {
      sessionId: string;
      taskId: string;
      blockId: string;
      title: string;
      coveragePct: number | null;
    };
  }>;
};

type VineyardMapProps = {
  blocks: MapBlock[];
  geoJson: MapBlockFeatureCollection;
  pumpsGeoJson: PumpFeatureCollection;
  gpsTracksGeoJson: GpsTrackFeatureCollection;
  bounds: [[number, number], [number, number]] | null;
  token: string;
  viewMode: MapViewMode;
  highlightedBlockIds?: string[];
  selectedPumpId?: string | null;
  onBlockSelect: (blockId: string) => void;
  onPumpSelect?: (pumpId: string) => void;
};

function highlightFillColor(ids: string[]): ExpressionSpecification {
  if (ids.length === 0) return blockFillColor;
  return [
    "case",
    ["in", ["get", "blockId"], ["literal", ids]],
    "#38bdf8",
    blockFillColor,
  ];
}

function highlightOutlineColor(ids: string[]): ExpressionSpecification {
  if (ids.length === 0) return blockOutlineColor;
  return [
    "case",
    ["in", ["get", "blockId"], ["literal", ids]],
    "#0284c7",
    blockOutlineColor,
  ];
}

function registerBlockClicks(
  map: mapboxgl.Map,
  layerIds: string[],
  onSelect: (blockId: string) => void,
) {
  for (const layerId of layerIds) {
    map.on("click", layerId, (event) => {
      const feature = event.features?.[0] as
        | { properties?: { blockId?: string } }
        | undefined;
      const blockId = feature?.properties?.blockId;
      if (typeof blockId === "string") onSelect(blockId);
    });

    map.on("mouseenter", layerId, () => {
      map.getCanvas().style.cursor = "pointer";
    });

    map.on("mouseleave", layerId, () => {
      map.getCanvas().style.cursor = "";
    });
  }
}

function registerPumpClicks(
  map: mapboxgl.Map,
  onSelect: (pumpId: string) => void,
) {
  map.on("click", PUMP_LAYER_ID, (event) => {
    const feature = event.features?.[0] as
      | { properties?: { pumpId?: string } }
      | undefined;
    const pumpId = feature?.properties?.pumpId;
    if (typeof pumpId === "string") onSelect(pumpId);
  });

  map.on("mouseenter", PUMP_LAYER_ID, () => {
    map.getCanvas().style.cursor = "pointer";
  });

  map.on("mouseleave", PUMP_LAYER_ID, () => {
    map.getCanvas().style.cursor = "";
  });
}

function applyViewMode(map: mapboxgl.Map, viewMode: MapViewMode) {
  const is3d = viewMode === "3d";

  if (map.getLayer(FILL_LAYER_ID)) {
    map.setLayoutProperty(FILL_LAYER_ID, "visibility", is3d ? "none" : "visible");
  }
  if (map.getLayer(EXTRUSION_LAYER_ID)) {
    map.setLayoutProperty(
      EXTRUSION_LAYER_ID,
      "visibility",
      is3d ? "visible" : "none",
    );
  }

  if (is3d) {
    if (!map.getSource(TERRAIN_SOURCE_ID)) {
      map.addSource(TERRAIN_SOURCE_ID, {
        type: "raster-dem",
        url: "mapbox://mapbox.mapbox-terrain-dem-v1",
        tileSize: 512,
        maxzoom: 14,
      });
    }
    map.setTerrain({ source: TERRAIN_SOURCE_ID, exaggeration: TERRAIN_EXAGGERATION });
    map.easeTo({
      pitch: MAP_3D_PITCH,
      bearing: MAP_3D_BEARING,
      duration: 800,
    });
  } else {
    map.setTerrain(null);
    map.easeTo({
      pitch: 0,
      bearing: 0,
      duration: 800,
    });
  }
}

export function VineyardMap({
  blocks,
  geoJson,
  pumpsGeoJson,
  gpsTracksGeoJson,
  bounds,
  token,
  viewMode,
  highlightedBlockIds = [],
  selectedPumpId = null,
  onBlockSelect,
  onPumpSelect,
}: VineyardMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const readyRef = useRef(false);
  const viewModeRef = useRef(viewMode);
  const onBlockSelectRef = useRef(onBlockSelect);
  const onPumpSelectRef = useRef(onPumpSelect);

  useEffect(() => {
    onBlockSelectRef.current = onBlockSelect;
  }, [onBlockSelect]);

  useEffect(() => {
    onPumpSelectRef.current = onPumpSelect;
  }, [onPumpSelect]);

  useEffect(() => {
    viewModeRef.current = viewMode;
  }, [viewMode]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const defaultCenter: [number, number] =
      blocks[0] != null
        ? [blocks[0].centerLng, blocks[0].centerLat]
        : [ESTATE_CENTER.lng, ESTATE_CENTER.lat];

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: defaultCenter,
      zoom: 14,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: true }), "top-left");
    map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

    map.on("load", () => {
      map.addSource(MAP_SOURCE_ID, {
        type: "geojson",
        data: geoJson,
      });

      map.addLayer({
        id: FILL_LAYER_ID,
        type: "fill",
        source: MAP_SOURCE_ID,
        layout: { visibility: viewModeRef.current === "3d" ? "none" : "visible" },
        paint: {
          "fill-color": blockFillColor,
          "fill-opacity": 0.45,
        },
      });

      map.addLayer({
        id: EXTRUSION_LAYER_ID,
        type: "fill-extrusion",
        source: MAP_SOURCE_ID,
        layout: { visibility: viewModeRef.current === "3d" ? "visible" : "none" },
        paint: {
          "fill-extrusion-color": blockFillColor,
          "fill-extrusion-height": blockExtrusionHeight,
          "fill-extrusion-base": extrusionBaseHeight,
          "fill-extrusion-opacity": 0.85,
        },
      });

      map.addLayer({
        id: OUTLINE_LAYER_ID,
        type: "line",
        source: MAP_SOURCE_ID,
        paint: {
          "line-color": blockOutlineColor,
          "line-width": 2,
        },
      });

      map.addSource(PUMP_SOURCE_ID, {
        type: "geojson",
        data: pumpsGeoJson,
      });

      map.addLayer({
        id: PUMP_LAYER_ID,
        type: "circle",
        source: PUMP_SOURCE_ID,
        paint: {
          "circle-radius": [
            "case",
            ["==", ["get", "pumpId"], selectedPumpId ?? ""],
            12,
            8,
          ],
          "circle-color": "#0ea5e9",
          "circle-stroke-width": [
            "case",
            ["==", ["get", "pumpId"], selectedPumpId ?? ""],
            3,
            2,
          ],
          "circle-stroke-color": "#ffffff",
        },
      });

      map.addSource(GPS_TRACK_SOURCE_ID, {
        type: "geojson",
        data: gpsTracksGeoJson,
      });

      map.addLayer({
        id: GPS_TRACK_LAYER_ID,
        type: "line",
        source: GPS_TRACK_SOURCE_ID,
        paint: {
          "line-color": "#f59e0b",
          "line-width": 3,
          "line-opacity": 0.9,
        },
      });

      registerBlockClicks(map, [...BLOCK_LAYER_IDS], (blockId) =>
        onBlockSelectRef.current(blockId),
      );

      if (onPumpSelectRef.current) {
        registerPumpClicks(map, (pumpId) => onPumpSelectRef.current?.(pumpId));
      }

      if (bounds) {
        map.fitBounds(bounds, { padding: 48, maxZoom: 16, duration: 0 });
      }

      if (viewModeRef.current === "3d") {
        applyViewMode(map, "3d");
      }

      readyRef.current = true;
    });

    mapRef.current = map;

    return () => {
      readyRef.current = false;
      map.remove();
      mapRef.current = null;
    };
  }, [blocks, bounds, geoJson, gpsTracksGeoJson, pumpsGeoJson, token, selectedPumpId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const apply = () => {
      readyRef.current = true;
      applyViewMode(map, viewModeRef.current);
    };

    if (map.isStyleLoaded()) {
      apply();
      return;
    }

    map.once("load", apply);
  }, [viewMode]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const source = map.getSource(MAP_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    source?.setData(geoJson);
  }, [geoJson]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const source = map.getSource(GPS_TRACK_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    source?.setData(gpsTracksGeoJson);
  }, [gpsTracksGeoJson]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const source = map.getSource(PUMP_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    source?.setData(pumpsGeoJson);
  }, [pumpsGeoJson]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;

    if (map.getLayer(FILL_LAYER_ID)) {
      map.setPaintProperty(FILL_LAYER_ID, "fill-color", highlightFillColor(highlightedBlockIds));
      map.setPaintProperty(
        FILL_LAYER_ID,
        "fill-opacity",
        highlightedBlockIds.length > 0 ? 0.65 : 0.45,
      );
    }
    if (map.getLayer(EXTRUSION_LAYER_ID)) {
      map.setPaintProperty(
        EXTRUSION_LAYER_ID,
        "fill-extrusion-color",
        highlightFillColor(highlightedBlockIds),
      );
    }
    if (map.getLayer(OUTLINE_LAYER_ID)) {
      map.setPaintProperty(
        OUTLINE_LAYER_ID,
        "line-color",
        highlightOutlineColor(highlightedBlockIds),
      );
      map.setPaintProperty(
        OUTLINE_LAYER_ID,
        "line-width",
        highlightedBlockIds.length > 0 ? 3 : 2,
      );
    }
    if (map.getLayer(PUMP_LAYER_ID)) {
      map.setPaintProperty(PUMP_LAYER_ID, "circle-radius", [
        "case",
        ["==", ["get", "pumpId"], selectedPumpId ?? ""],
        12,
        8,
      ]);
      map.setPaintProperty(PUMP_LAYER_ID, "circle-stroke-width", [
        "case",
        ["==", ["get", "pumpId"], selectedPumpId ?? ""],
        3,
        2,
      ]);
    }
  }, [highlightedBlockIds, selectedPumpId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !readyRef.current || !selectedPumpId) return;

    const pump = pumpsGeoJson.features.find(
      (f) => f.properties.pumpId === selectedPumpId,
    );
    if (!pump) return;

    map.easeTo({
      center: pump.geometry.coordinates,
      zoom: Math.max(map.getZoom(), 15),
      duration: 800,
    });
  }, [selectedPumpId, pumpsGeoJson]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full"
      role="region"
      aria-label="Interactive vineyard block map"
    />
  );
}
