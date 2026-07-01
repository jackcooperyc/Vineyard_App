/** Audited GIS centroid — Cooper Estate, Red Mountain AVA */
export const ESTATE_CENTER = { lat: 46.26513, lng: -119.45518 } as const;

/** Terrain reference — estate minimum elevation (m) from source data */
export const ELEVATION_BASE_M = 198.66;

export const MAP_3D_PITCH = 60;
export const MAP_3D_BEARING = -20;
export const TERRAIN_EXAGGERATION = 1.4;
export const EXTRUSION_HEIGHT_MULTIPLIER = 10;

export type MapViewMode = "2d" | "3d";
