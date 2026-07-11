"use client";

import { useEffect, useRef, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { ESTATE_CENTER, type MapColorMode } from "@/domains/map/constants";
import type { MapBlockFeatureCollection } from "@/domains/map/types";
import {
  createTourPOIMarkerElement,
  updateTourPOIMarkerElement,
} from "@/components/tours/tour-poi-icons";
import type { MapTourPOIGeo } from "@/domains/tours/map-geo";
import {
  FILL_LAYER_ID,
  MAP_SOURCE_ID,
  OUTLINE_LAYER_ID,
  buildBlockFillColor,
  buildBlockOutlineColor,
} from "@/lib/maps/layers";

type TourVineyardMapProps = {
  geoJson: MapBlockFeatureCollection;
  bounds: [[number, number], [number, number]] | null;
  token: string;
  pois: MapTourPOIGeo[];
  colorMode: MapColorMode;
  canManage: boolean;
  selectedPoiId: string | null;
  onMapClick: (lat: number, lng: number) => void;
  onPoiSelect: (poiId: string) => void;
  onPoiRelocate: (poiId: string, lat: number, lng: number) => void;
};

export function TourVineyardMap({
  geoJson,
  bounds,
  token,
  pois,
  colorMode,
  canManage,
  selectedPoiId,
  onMapClick,
  onPoiSelect,
  onPoiRelocate,
}: TourVineyardMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<Map<string, mapboxgl.Marker>>(new Map());
  const onMapClickRef = useRef(onMapClick);
  const onPoiSelectRef = useRef(onPoiSelect);
  const onPoiRelocateRef = useRef(onPoiRelocate);
  const canManageRef = useRef(canManage);
  const colorModeRef = useRef(colorMode);

  useEffect(() => {
    onMapClickRef.current = onMapClick;
  }, [onMapClick]);

  useEffect(() => {
    onPoiSelectRef.current = onPoiSelect;
  }, [onPoiSelect]);

  useEffect(() => {
    onPoiRelocateRef.current = onPoiRelocate;
  }, [onPoiRelocate]);

  useEffect(() => {
    canManageRef.current = canManage;
  }, [canManage]);

  useEffect(() => {
    colorModeRef.current = colorMode;
  }, [colorMode]);

  const syncMarkers = useCallback(
    (map: mapboxgl.Map, nextPois: MapTourPOIGeo[], selectedId: string | null) => {
      const emphasized = colorModeRef.current === "tours";
      const existing = markersRef.current;
      const nextIds = new Set(nextPois.map((p) => p.id));

      for (const [id, marker] of existing) {
        if (!nextIds.has(id)) {
          marker.remove();
          existing.delete(id);
        }
      }

      for (const poi of nextPois) {
        const [lng, lat] = poi.coordinates;
        let marker = existing.get(poi.id);

        const isSelected = poi.id === selectedId;

        if (!marker) {
          const element = createTourPOIMarkerElement(poi.category, isSelected, emphasized);
          element.addEventListener("click", (event) => {
            event.stopPropagation();
            onPoiSelectRef.current(poi.id);
          });

          marker = new mapboxgl.Marker({
            element,
            anchor: "bottom",
            draggable: canManageRef.current,
          })
            .setLngLat([lng, lat])
            .addTo(map);

          marker.on("dragend", () => {
            const { lng: newLng, lat: newLat } = marker!.getLngLat();
            onPoiRelocateRef.current(poi.id, newLat, newLng);
          });

          existing.set(poi.id, marker);
        } else {
          const current = marker.getLngLat();
          if (
            Math.abs(current.lat - lat) > 1e-7 ||
            Math.abs(current.lng - lng) > 1e-7
          ) {
            marker.setLngLat([lng, lat]);
          }
          marker.setDraggable(canManageRef.current);
          updateTourPOIMarkerElement(
            marker.getElement(),
            poi.category,
            isSelected,
            emphasized,
          );
        }
      }
    },
    [],
  );

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [ESTATE_CENTER.lng, ESTATE_CENTER.lat],
      zoom: 14,
      attributionControl: false,
    });

    map.addControl(new mapboxgl.NavigationControl({ showCompass: false }), "top-right");
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-right",
    );

    map.on("load", () => {
      map.addSource(MAP_SOURCE_ID, {
        type: "geojson",
        data: geoJson,
      });

      map.addLayer({
        id: FILL_LAYER_ID,
        type: "fill",
        source: MAP_SOURCE_ID,
        paint: {
          "fill-color": buildBlockFillColor(colorMode),
          "fill-opacity": colorMode === "tours" ? 0.28 : 0.45,
        },
      });

      map.addLayer({
        id: OUTLINE_LAYER_ID,
        type: "line",
        source: MAP_SOURCE_ID,
        paint: {
          "line-color": buildBlockOutlineColor(colorMode),
          "line-width": 2,
        },
      });

      if (bounds) {
        map.fitBounds(bounds, { padding: 48, maxZoom: 16, duration: 0 });
      }

      syncMarkers(map, pois, selectedPoiId);
    });

    map.on("click", (event) => {
      if (!canManageRef.current) return;
      const target = event.originalEvent.target as HTMLElement | null;
      if (target?.closest(".mapboxgl-marker")) return;
      onMapClickRef.current(event.lngLat.lat, event.lngLat.lng);
    });

    mapRef.current = map;
    const markers = markersRef.current;

    return () => {
      for (const marker of markers.values()) {
        marker.remove();
      }
      markers.clear();
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init map once per token
  }, [token]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    const source = map.getSource(MAP_SOURCE_ID) as mapboxgl.GeoJSONSource | undefined;
    source?.setData(geoJson);
  }, [geoJson]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !map.isStyleLoaded()) return;
    if (!map.getLayer(FILL_LAYER_ID)) return;

    map.setPaintProperty(FILL_LAYER_ID, "fill-color", buildBlockFillColor(colorMode));
    map.setPaintProperty(
      FILL_LAYER_ID,
      "fill-opacity",
      colorMode === "tours" ? 0.28 : 0.45,
    );
    map.setPaintProperty(OUTLINE_LAYER_ID, "line-color", buildBlockOutlineColor(colorMode));
    syncMarkers(map, pois, selectedPoiId);
  }, [colorMode, pois, selectedPoiId, canManage, syncMarkers]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedPoiId) return;
    const poi = pois.find((p) => p.id === selectedPoiId);
    if (!poi) return;
    map.easeTo({
      center: poi.coordinates,
      zoom: Math.max(map.getZoom(), 15),
      duration: 600,
    });
    // Only recenter when selection changes — not when pois array is refreshed.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, [selectedPoiId]);

  return (
    <div
      ref={containerRef}
      className="absolute inset-0 h-full w-full"
      role="region"
      aria-label="Tour points of interest map"
    />
  );
}
