import type { BlockStatus, BlockType } from "@/generated/prisma/client";

export type MapBlockOverlay = "default" | "tasks" | "irrigation";

export type MapBlockGeometry = {
  type: "Polygon";
  coordinates: number[][][];
};

export type MapBlock = {
  id: string;
  code: string;
  name: string;
  status: BlockStatus;
  blockType: BlockType;
  infrastructureType: string | null;
  primaryVariety: string | null;
  primaryVarietyId: string | null;
  varietyColorHex: string | null;
  totalVines: number;
  acreage: number | null;
  elevMin: number | null;
  elevMed: number | null;
  elevMax: number | null;
  colorHex: string | null;
  centerLat: number;
  centerLng: number;
  geometry: MapBlockGeometry;
  openTasks: number;
  irrigationOverdue: boolean;
  overlay: MapBlockOverlay;
  openTaskEquipment: { id: string; name: string; type: string }[];
};

export type MapBlockFeatureProperties = {
  blockId: string;
  code: string;
  name: string;
  overlay: MapBlockOverlay;
  blockType: BlockType;
  openTasks: number;
  irrigationOverdue: boolean;
  elevMed: number | null;
  /** Client-side: Mapbox DEM elevation at block centroid (m MSL) */
  terrainBaseM?: number;
  /** Present only when a real hex string — omit nulls for Mapbox. */
  colorHex?: string;
  varietyColorHex?: string;
  varietyName?: string;
  infrastructureType?: string;
  acreage?: number;
};

export type MapBlockFeatureCollection = {
  type: "FeatureCollection";
  features: Array<{
    type: "Feature";
    id: string;
    geometry: MapBlockGeometry;
    properties: MapBlockFeatureProperties;
  }>;
};
