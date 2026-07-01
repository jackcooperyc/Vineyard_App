/** Audited GIS centroid — Cooper Estate, Red Mountain AVA */
export const ESTATE_WEATHER_LOCATION = {
  lat: 46.26513,
  lng: -119.45518,
} as const;

/** Cache TTL for estate weather fetches (15 minutes) */
export const WEATHER_CACHE_TTL_SEC = 900;

export const WEATHER_PROVIDERS = ["open-meteo", "openweather"] as const;

export type WeatherProviderName = (typeof WEATHER_PROVIDERS)[number];

export const DEFAULT_WEATHER_PROVIDER: WeatherProviderName = "open-meteo";
