import type { ExpressionSpecification } from "mapbox-gl";
import {
  ELEVATION_BASE_M,
  EXTRUSION_HEIGHT_MULTIPLIER,
} from "@/domains/map/constants";

export const MAP_SOURCE_ID = "blocks";
export const PUMP_SOURCE_ID = "pumps";
export const GPS_TRACK_SOURCE_ID = "gps-tracks";
export const TERRAIN_SOURCE_ID = "mapbox-dem";
export const FILL_LAYER_ID = "blocks-fill";
export const EXTRUSION_LAYER_ID = "blocks-extrusion";
export const OUTLINE_LAYER_ID = "blocks-outline";
export const PUMP_LAYER_ID = "pumps-circle";
export const GPS_TRACK_LAYER_ID = "gps-tracks-line";

export const BLOCK_LAYER_IDS = [
  FILL_LAYER_ID,
  EXTRUSION_LAYER_ID,
  OUTLINE_LAYER_ID,
] as const;

const overlayColor: ExpressionSpecification = [
  "match",
  ["get", "overlay"],
  "irrigation",
  "#3b82f6",
  "tasks",
  "#f59e0b",
  "#22c55e",
];

export const blockFillColor: ExpressionSpecification = [
  "case",
  ["all", ["has", "colorHex"], ["!=", ["get", "colorHex"], ""]],
  ["get", "colorHex"],
  overlayColor,
];

export const blockOutlineColor: ExpressionSpecification = [
  "case",
  ["all", ["has", "colorHex"], ["!=", ["get", "colorHex"], ""]],
  ["get", "colorHex"],
  [
    "match",
    ["get", "overlay"],
    "irrigation",
    "#1d4ed8",
    "tasks",
    "#b45309",
    "#15803d",
  ],
];

export const blockExtrusionHeight: ExpressionSpecification = [
  "case",
  ["==", ["get", "blockType"], "VINEYARD"],
  [
    "*",
    ["-", ["coalesce", ["get", "elevMed"], 205], ELEVATION_BASE_M],
    EXTRUSION_HEIGHT_MULTIPLIER,
  ],
  0,
];

export const extrusionBaseHeight =
  ELEVATION_BASE_M as unknown as ExpressionSpecification;
