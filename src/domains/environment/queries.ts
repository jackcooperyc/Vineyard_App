import { db } from "@/lib/db";
import {
  DEFAULT_FROST_WARNING_TEMP_F,
  DEFAULT_HEAT_STRESS_TEMP_F,
} from "@/domains/environment/constants";

export type EnvironmentalThresholds = {
  frostWarningTempF: number;
  heatStressTempF: number;
};

export async function getEnvironmentalThresholds(): Promise<EnvironmentalThresholds> {
  const vineyard = await db.vineyard.findFirst({
    select: {
      environmentalThreshold: {
        select: {
          frostWarningTempF: true,
          heatStressTempF: true,
        },
      },
    },
  });

  const stored = vineyard?.environmentalThreshold;
  if (stored) {
    return {
      frostWarningTempF: stored.frostWarningTempF,
      heatStressTempF: stored.heatStressTempF,
    };
  }

  return {
    frostWarningTempF: DEFAULT_FROST_WARNING_TEMP_F,
    heatStressTempF: DEFAULT_HEAT_STRESS_TEMP_F,
  };
}
