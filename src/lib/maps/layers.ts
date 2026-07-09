import type { ExpressionSpecification } from "mapbox-gl";
import {
  BLOCK_EXTRUSION_CAP_M,
  ELEVATION_BASE_M,
  type MapColorMode,
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

const INFRASTRUCTURE_VARIETAL_COLOR = "#9ca3af";
const UNKNOWN_VARIETAL_COLOR = "#6b7280";
const STATUS_FALLBACK_FILL = "#22c55e";
const TOURS_MODE_FILL = "#64748b";
const TOURS_MODE_OUTLINE = "#475569";

const statusOverlayFill: ExpressionSpecification = [
  "match",
  ["get", "overlay"],
  "irrigation",
  "#3b82f6",
  "tasks",
  "#f59e0b",
  STATUS_FALLBACK_FILL,
];

const statusOverlayOutline: ExpressionSpecification = [
  "match",
  ["get", "overlay"],
  "irrigation",
  "#1d4ed8",
  "tasks",
  "#b45309",
  "#15803d",
];

const blockColorHexOverride: ExpressionSpecification = [
  "all",
  ["has", "colorHex"],
  ["!=", ["get", "colorHex"], ""],
];

/**
 * Block fill color precedence:
 * 1. Block.colorHex manual override (any mode)
 * 2. Varietal mode → varietyColorHex (vineyard) or neutral gray (infrastructure)
 * 3. Status mode → overlay match (irrigation / tasks / default green)
 */
export function buildBlockFillColor(
  mode: MapColorMode,
): ExpressionSpecification {
  if (mode === "tours") {
    return [
      "case",
      blockColorHexOverride,
      ["get", "colorHex"],
      TOURS_MODE_FILL,
    ];
  }

  if (mode === "varietal") {
    return [
      "case",
      blockColorHexOverride,
      ["get", "colorHex"],
      ["==", ["get", "blockType"], "INFRASTRUCTURE"],
      INFRASTRUCTURE_VARIETAL_COLOR,
      [
        "all",
        ["has", "varietyColorHex"],
        ["!=", ["get", "varietyColorHex"], ""],
      ],
      ["get", "varietyColorHex"],
      UNKNOWN_VARIETAL_COLOR,
    ];
  }

  return [
    "case",
    blockColorHexOverride,
    ["get", "colorHex"],
    statusOverlayFill,
  ];
}

export function buildBlockOutlineColor(
  mode: MapColorMode,
): ExpressionSpecification {
  if (mode === "tours") {
    return [
      "case",
      blockColorHexOverride,
      ["get", "colorHex"],
      TOURS_MODE_OUTLINE,
    ];
  }

  if (mode === "varietal") {
    return [
      "case",
      blockColorHexOverride,
      ["get", "colorHex"],
      ["==", ["get", "blockType"], "INFRASTRUCTURE"],
      "#6b7280",
      [
        "all",
        ["has", "varietyColorHex"],
        ["!=", ["get", "varietyColorHex"], ""],
      ],
      ["get", "varietyColorHex"],
      "#4b5563",
    ];
  }

  return [
    "case",
    blockColorHexOverride,
    ["get", "colorHex"],
    statusOverlayOutline,
  ];
}

/** @deprecated Use buildBlockFillColor("status") */
export const blockFillColor = buildBlockFillColor("status");

/** @deprecated Use buildBlockOutlineColor("status") */
export const blockOutlineColor = buildBlockOutlineColor("status");

/** Sampled terrain elevation (m MSL); falls back to elevMed then estate base */
export const extrusionBaseHeight: ExpressionSpecification = [
  "coalesce",
  ["get", "terrainBaseM"],
  ["get", "elevMed"],
  ELEVATION_BASE_M,
];

/** Vineyard blocks: thin cap above terrain; infrastructure: flat at terrain */
export const blockExtrusionHeight: ExpressionSpecification = [
  "case",
  ["==", ["get", "blockType"], "VINEYARD"],
  ["+", extrusionBaseHeight, BLOCK_EXTRUSION_CAP_M],
  extrusionBaseHeight,
];
