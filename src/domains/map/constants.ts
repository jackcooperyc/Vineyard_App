/** Audited GIS centroid — Cooper Estate, Red Mountain AVA */
export const ESTATE_CENTER = { lat: 46.26513, lng: -119.45518 } as const;

/** Terrain reference — estate minimum elevation (m); fallback when DEM sampling fails */
export const ELEVATION_BASE_M = 198.66;

export const MAP_3D_PITCH = 60;
export const MAP_3D_BEARING = -20;
export const TERRAIN_EXAGGERATION = 1.4;

/** Thin vineyard block cap above sampled terrain (m) for visibility in 3D */
export const BLOCK_EXTRUSION_CAP_M = 3;

export type MapViewMode = "2d" | "3d";
export type MapColorMode = "status" | "varietal";
