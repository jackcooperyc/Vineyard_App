import type { BlockStatus } from "@/generated/prisma/client";

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
  primaryVariety: string | null;
  totalVines: number;
  centerLat: number;
  centerLng: number;
  geometry: MapBlockGeometry;
  openTasks: number;
  irrigationOverdue: boolean;
  overlay: MapBlockOverlay;
};

export type MapBlockFeatureProperties = {
  blockId: string;
  code: string;
  name: string;
  overlay: MapBlockOverlay;
  openTasks: number;
  irrigationOverdue: boolean;
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
