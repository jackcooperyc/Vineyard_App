import {
  DEFAULT_WEATHER_PROVIDER,
  type WeatherProviderName,
} from "@/domains/weather/constants";
import type { WeatherProvider } from "@/domains/weather/types";
import { openMeteoProvider } from "@/domains/weather/providers/open-meteo";

const PROVIDERS: Record<WeatherProviderName, WeatherProvider> = {
  "open-meteo": openMeteoProvider,
  openweather: {
    async getCurrent() {
      throw new Error(
        "OpenWeather adapter not implemented — set WEATHER_PROVIDER=open-meteo",
      );
    },
    async getForecast() {
      throw new Error(
        "OpenWeather adapter not implemented — set WEATHER_PROVIDER=open-meteo",
      );
    },
  },
};

export function resolveWeatherProvider(): WeatherProvider {
  const name = (process.env.WEATHER_PROVIDER ??
    DEFAULT_WEATHER_PROVIDER) as WeatherProviderName;

  const provider = PROVIDERS[name];
  if (!provider) {
    throw new Error(`Unknown WEATHER_PROVIDER: ${name}`);
  }

  return provider;
}
