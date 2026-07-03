"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

type PumpLocationPickerProps = {
  token: string;
  lat: number;
  lng: number;
  onChange: (lat: number, lng: number) => void;
};

export function PumpLocationPicker({
  token,
  lat,
  lng,
  onChange,
}: PumpLocationPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markerRef = useRef<mapboxgl.Marker | null>(null);
  const onChangeRef = useRef(onChange);

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: containerRef.current,
      style: "mapbox://styles/mapbox/satellite-streets-v12",
      center: [lng, lat],
      zoom: 15,
      attributionControl: false,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right",
    );
    map.addControl(
      new mapboxgl.AttributionControl({ compact: true }),
      "bottom-right",
    );

    const marker = new mapboxgl.Marker({ draggable: true, color: "#0ea5e9" })
      .setLngLat([lng, lat])
      .addTo(map);

    marker.on("dragend", () => {
      const { lng: newLng, lat: newLat } = marker.getLngLat();
      onChangeRef.current(newLat, newLng);
    });

    map.on("click", (event) => {
      const { lng: newLng, lat: newLat } = event.lngLat;
      marker.setLngLat([newLng, newLat]);
      onChangeRef.current(newLat, newLng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      marker.remove();
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- init map once per token
  }, [token]);

  useEffect(() => {
    const marker = markerRef.current;
    if (!marker) return;
    const current = marker.getLngLat();
    if (
      Math.abs(current.lat - lat) > 1e-7 ||
      Math.abs(current.lng - lng) > 1e-7
    ) {
      marker.setLngLat([lng, lat]);
    }
  }, [lat, lng]);

  return (
    <div className="space-y-2">
      <div
        ref={containerRef}
        className="h-56 w-full overflow-hidden rounded-lg border"
        aria-label="Pump location map"
      />
      <p className="text-xs text-muted-foreground">
        Click the map or drag the pin to set the pump location.
      </p>
    </div>
  );
}
