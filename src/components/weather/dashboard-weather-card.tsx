import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { WeatherIcon } from "@/components/weather/weather-icon";
import type { EnvironmentalThresholds } from "@/domains/environment/queries";
import type { CurrentWeather, ForecastDay } from "@/domains/weather/types";

function formatWindDirection(degrees: number): string {
  const directions = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
  const index = Math.round(degrees / 45) % 8;
  return directions[index] ?? "—";
}

function frostRiskHint(
  current: CurrentWeather,
  forecast: ForecastDay[],
  thresholds: EnvironmentalThresholds,
): string | null {
  if (current.temperatureF <= thresholds.frostWarningTempF) {
    return `Frost risk now — ${Math.round(current.temperatureF)}°F at estate center (threshold ${thresholds.frostWarningTempF}°F)`;
  }

  const tonight = forecast[0];
  if (
    tonight &&
    tonight.tempMinF <= thresholds.frostWarningTempF
  ) {
    return `Overnight frost possible — low ${Math.round(tonight.tempMinF)}°F (threshold ${thresholds.frostWarningTempF}°F)`;
  }

  if (current.temperatureF >= thresholds.heatStressTempF) {
    return `Heat stress — ${Math.round(current.temperatureF)}°F (threshold ${thresholds.heatStressTempF}°F)`;
  }

  return null;
}

export function DashboardWeatherCard({
  current,
  forecast,
  thresholds,
}: {
  current: CurrentWeather;
  forecast: ForecastDay[];
  thresholds: EnvironmentalThresholds;
}) {
  const riskHint = frostRiskHint(current, forecast, thresholds);
  const observed = new Date(current.observedAt);

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between gap-4 pb-2">
        <div>
          <CardTitle>Estate weather</CardTitle>
          <CardDescription>
            Red Mountain center · Open-Meteo · updated{" "}
            {observed.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}
          </CardDescription>
        </div>
        <WeatherIcon icon={current.icon} className="size-8 text-muted-foreground" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-end gap-x-6 gap-y-2">
          <div>
            <p className="text-4xl font-bold tabular-nums">
              {Math.round(current.temperatureF)}°F
            </p>
            <p className="text-sm text-muted-foreground">{current.condition}</p>
          </div>
          <div className="text-sm text-muted-foreground">
            <p>
              Wind {Math.round(current.windSpeedMph)} mph{" "}
              {formatWindDirection(current.windDirectionDeg)}
            </p>
            <p>Humidity {Math.round(current.humidityPercent)}%</p>
          </div>
        </div>

        {riskHint && (
          <p className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-950 dark:text-amber-100">
            {riskHint}
          </p>
        )}

        {forecast.length > 0 && (
          <div className="grid grid-cols-3 gap-2 border-t pt-4 sm:grid-cols-5">
            {forecast.slice(0, 5).map((day) => {
              const date = new Date(`${day.date}T12:00:00`);
              return (
                <div
                  key={day.date}
                  className="flex flex-col items-center gap-1 rounded-lg bg-muted/50 px-2 py-2 text-center"
                >
                  <span className="text-xs font-medium text-muted-foreground">
                    {date.toLocaleDateString([], { weekday: "short" })}
                  </span>
                  <WeatherIcon icon={day.icon} className="size-4" />
                  <span className="text-xs tabular-nums">
                    {Math.round(day.tempMaxF)}° / {Math.round(day.tempMinF)}°
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
