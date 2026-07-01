import { unstable_cache } from "next/cache";
import {
  ESTATE_WEATHER_LOCATION,
  WEATHER_CACHE_TTL_SEC,
} from "@/domains/weather/constants";
import { resolveWeatherProvider } from "@/domains/weather/providers/registry";
import type { CurrentWeather, ForecastDay } from "@/domains/weather/types";

function weatherCacheKey(scope: "current" | "forecast"): string[] {
  const provider = process.env.WEATHER_PROVIDER ?? "open-meteo";
  return [
    "weather",
    scope,
    provider,
    String(ESTATE_WEATHER_LOCATION.lat),
    String(ESTATE_WEATHER_LOCATION.lng),
  ];
}

const getCachedCurrentWeather = unstable_cache(
  async (): Promise<CurrentWeather> => {
    const provider = resolveWeatherProvider();
    return provider.getCurrent();
  },
  weatherCacheKey("current"),
  { revalidate: WEATHER_CACHE_TTL_SEC },
);

const getCachedWeatherForecast = unstable_cache(
  async (): Promise<ForecastDay[]> => {
    const provider = resolveWeatherProvider();
    return provider.getForecast();
  },
  weatherCacheKey("forecast"),
  { revalidate: WEATHER_CACHE_TTL_SEC },
);

export async function getCurrentWeather(): Promise<CurrentWeather> {
  return getCachedCurrentWeather();
}

export async function getWeatherForecast(): Promise<ForecastDay[]> {
  return getCachedWeatherForecast();
}
