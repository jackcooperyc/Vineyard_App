/** WMO Weather interpretation codes (WW) — Open-Meteo table */
const WMO_CODES: Record<number, { label: string; icon: string }> = {
  0: { label: "Clear", icon: "sun" },
  1: { label: "Mainly clear", icon: "sun" },
  2: { label: "Partly cloudy", icon: "cloud-sun" },
  3: { label: "Overcast", icon: "cloud" },
  45: { label: "Fog", icon: "cloud-fog" },
  48: { label: "Depositing rime fog", icon: "cloud-fog" },
  51: { label: "Light drizzle", icon: "cloud-drizzle" },
  53: { label: "Moderate drizzle", icon: "cloud-drizzle" },
  55: { label: "Dense drizzle", icon: "cloud-drizzle" },
  56: { label: "Light freezing drizzle", icon: "cloud-drizzle" },
  57: { label: "Dense freezing drizzle", icon: "cloud-drizzle" },
  61: { label: "Light rain", icon: "cloud-rain" },
  63: { label: "Moderate rain", icon: "cloud-rain" },
  65: { label: "Heavy rain", icon: "cloud-rain" },
  66: { label: "Light freezing rain", icon: "cloud-rain" },
  67: { label: "Heavy freezing rain", icon: "cloud-rain" },
  71: { label: "Light snow", icon: "cloud-snow" },
  73: { label: "Moderate snow", icon: "cloud-snow" },
  75: { label: "Heavy snow", icon: "cloud-snow" },
  77: { label: "Snow grains", icon: "cloud-snow" },
  80: { label: "Light rain showers", icon: "cloud-rain" },
  81: { label: "Moderate rain showers", icon: "cloud-rain" },
  82: { label: "Violent rain showers", icon: "cloud-rain" },
  85: { label: "Light snow showers", icon: "cloud-snow" },
  86: { label: "Heavy snow showers", icon: "cloud-snow" },
  95: { label: "Thunderstorm", icon: "cloud-lightning" },
  96: { label: "Thunderstorm with slight hail", icon: "cloud-lightning" },
  99: { label: "Thunderstorm with heavy hail", icon: "cloud-lightning" },
};

const FALLBACK = { label: "Unknown", icon: "cloud" } as const;

export function wmoCodeToCondition(code: number): { label: string; icon: string } {
  return WMO_CODES[code] ?? FALLBACK;
}
