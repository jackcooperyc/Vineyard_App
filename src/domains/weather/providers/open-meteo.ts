import {
  ESTATE_WEATHER_LOCATION,
  type WeatherProviderName,
} from "@/domains/weather/constants";
import type {
  CurrentWeather,
  ForecastDay,
  WeatherProvider,
} from "@/domains/weather/types";
import { wmoCodeToCondition } from "@/domains/weather/providers/wmo-codes";

const OPEN_METEO_BASE = "https://api.open-meteo.com/v1/forecast";

type OpenMeteoCurrentResponse = {
  current: {
    time: string;
    temperature_2m: number;
    relative_humidity_2m: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    weather_code: number;
  };
};

type OpenMeteoForecastResponse = {
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_probability_max: (number | null)[];
  };
};

function buildUrl(params: Record<string, string>): string {
  const search = new URLSearchParams({
    latitude: String(ESTATE_WEATHER_LOCATION.lat),
    longitude: String(ESTATE_WEATHER_LOCATION.lng),
    temperature_unit: "fahrenheit",
    wind_speed_unit: "mph",
    ...params,
  });
  return `${OPEN_METEO_BASE}?${search.toString()}`;
}

async function fetchOpenMeteo<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    next: { revalidate: 0 },
  });

  if (!response.ok) {
    throw new Error(
      `Open-Meteo request failed (${response.status} ${response.statusText})`,
    );
  }

  return response.json() as Promise<T>;
}

export const openMeteoProvider: WeatherProvider = {
  async getCurrent(): Promise<CurrentWeather> {
    const url = buildUrl({
      current:
        "temperature_2m,relative_humidity_2m,wind_speed_10m,wind_direction_10m,weather_code",
    });
    const data = await fetchOpenMeteo<OpenMeteoCurrentResponse>(url);
    const { current } = data;
    const { label, icon } = wmoCodeToCondition(current.weather_code);

    return {
      temperatureF: current.temperature_2m,
      humidityPercent: current.relative_humidity_2m,
      windSpeedMph: current.wind_speed_10m,
      windDirectionDeg: current.wind_direction_10m,
      condition: label,
      icon,
      weatherCode: current.weather_code,
      observedAt: current.time,
    };
  },

  async getForecast(): Promise<ForecastDay[]> {
    const url = buildUrl({
      daily:
        "temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max",
      forecast_days: "7",
    });
    const data = await fetchOpenMeteo<OpenMeteoForecastResponse>(url);
    const { daily } = data;

    return daily.time.map((date, index) => {
      const weatherCode = daily.weather_code[index] ?? 0;
      const { label, icon } = wmoCodeToCondition(weatherCode);

      return {
        date,
        tempMaxF: daily.temperature_2m_max[index] ?? 0,
        tempMinF: daily.temperature_2m_min[index] ?? 0,
        precipitationProbabilityPercent:
          daily.precipitation_probability_max[index] ?? null,
        condition: label,
        icon,
        weatherCode,
      };
    });
  },
};

export const openMeteoProviderName: WeatherProviderName = "open-meteo";
