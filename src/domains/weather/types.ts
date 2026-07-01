export type CurrentWeather = {
  temperatureF: number;
  humidityPercent: number;
  windSpeedMph: number;
  windDirectionDeg: number;
  condition: string;
  icon: string;
  weatherCode: number;
  observedAt: string;
};

export type ForecastDay = {
  date: string;
  tempMaxF: number;
  tempMinF: number;
  precipitationProbabilityPercent: number | null;
  condition: string;
  icon: string;
  weatherCode: number;
};

export interface WeatherProvider {
  getCurrent(): Promise<CurrentWeather>;
  getForecast(): Promise<ForecastDay[]>;
}
