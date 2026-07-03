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

export function defaultVarietyColorHex(name: string): string {
  return VARIETY_MAP_COLORS[name] ?? "#6b7280";
}
