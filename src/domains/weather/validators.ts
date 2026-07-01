import { z } from "zod";
import { WEATHER_PROVIDERS } from "@/domains/weather/constants";

export const weatherProviderSchema = z.enum(WEATHER_PROVIDERS);
