import { WeatherIcon } from "@/components/weather/weather-icon";
import type { CurrentWeather } from "@/domains/weather/types";

export function MapWeatherChip({ weather }: { weather: CurrentWeather }) {
  return (
    <div
      className="pointer-events-none absolute right-3 top-3 z-10 flex items-center gap-2 rounded-full border bg-background/90 px-3 py-2 text-sm shadow-sm backdrop-blur"
      aria-label={`Estate weather: ${Math.round(weather.temperatureF)} degrees Fahrenheit, ${weather.condition}`}
    >
      <WeatherIcon icon={weather.icon} className="size-4" />
      <span className="font-semibold tabular-nums">
        {Math.round(weather.temperatureF)}°F
      </span>
      <span className="hidden text-muted-foreground sm:inline">
        {weather.condition}
      </span>
    </div>
  );
}
