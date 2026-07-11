/** Default map display colors per estate variety (distinct, accessible hues). */
export const VARIETY_MAP_COLORS: Record<string, string> = {
  "Cabernet Sauvignon": "#7f1d1d",
  "Carménère": "#b91c1c",
  Merlot: "#dc2626",
  "Cabernet Franc": "#991b1b",
  "Petit Verdot": "#450a0a",
  Malbec: "#be123c",
  Chardonnay: "#ca8a04",
  Sangiovese: "#c2410c",
  Zinfandel: "#9f1239",
  Viognier: "#eab308",
  Nebbiolo: "#881337",
  Syrah: "#701a75",
  "Touriga Nacional": "#4c0519",
};

const HEX_COLOR = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function defaultVarietyColorHex(name: string): string {
  return VARIETY_MAP_COLORS[name] ?? "#6b7280";
}

/** True when value is a usable CSS hex color for Mapbox paint. */
export function isMapColorHex(value: string | null | undefined): value is string {
  return typeof value === "string" && HEX_COLOR.test(value.trim());
}

export function resolveVarietyMapColor(
  name: string | null | undefined,
  colorHex: string | null | undefined,
): string | null {
  if (isMapColorHex(colorHex)) return colorHex.trim();
  if (name) return defaultVarietyColorHex(name);
  return null;
}
