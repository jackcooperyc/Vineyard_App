# Weather domain

Server-side estate weather for Cooper Estate Vineyard (centroid `46.26513, -119.45518`).

## Provider interface

`WeatherProvider` (`types.ts`) defines:

- `getCurrent(): Promise<CurrentWeather>` — live conditions at the estate centroid
- `getForecast(): Promise<ForecastDay[]>` — 7-day daily forecast

UI and other domains should call `getCurrentWeather()` / `getWeatherForecast()` from `queries.ts`, not providers directly.

## Configuration

| Variable | Default | Notes |
|----------|---------|-------|
| `WEATHER_PROVIDER` | `open-meteo` | `open-meteo` \| `openweather` |
| `OPENWEATHER_API_KEY` | — | Required only when using the OpenWeather adapter (future) |

All weather env vars are **server-only**. Never use `NEXT_PUBLIC_` for API keys or provider selection.

## Caching

Fetches are wrapped in Next.js `unstable_cache` with a 15-minute TTL (`WEATHER_CACHE_TTL_SEC`). Cache keys include provider name and estate coordinates so switching providers or moving the centroid invalidates stale data.

## Adding a provider adapter

1. Create `providers/<name>.ts` implementing `WeatherProvider`.
2. Map the vendor response into `CurrentWeather` and `ForecastDay` (use `wmo-codes.ts` if the API returns WMO codes).
3. Register the adapter in `providers/registry.ts` under `PROVIDERS`.
4. Add the provider id to `WEATHER_PROVIDERS` in `constants.ts` and `weatherProviderSchema` in `validators.ts`.
5. Document any new env vars in `.env.example` (server-side only).

Example future adapter: `providers/openweather.ts` reading `process.env.OPENWEATHER_API_KEY`.

## v1 scope

- Open-Meteo (keyless) adapter only
- No dashboard or map UI in this ticket — queries are ready for Phase 2 UI work
