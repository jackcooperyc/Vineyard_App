export type MapPumpGeo = {
  id: string;
  name: string | null;
  coordinates: [number, number];
  servicedBlockIds: string[];
};

export function mapPumpsToGeoJSON(pumps: MapPumpGeo[]) {
  return {
    type: "FeatureCollection" as const,
    features: pumps.map((pump) => ({
      type: "Feature" as const,
      id: pump.id,
      geometry: {
        type: "Point" as const,
        coordinates: pump.coordinates,
      },
      properties: {
        pumpId: pump.id,
        name: pump.name ?? "Pump",
        servicedBlockIds: pump.servicedBlockIds,
      },
    })),
  };
}

export function getPumpsForBlock(pumps: MapPumpGeo[], blockId: string): MapPumpGeo[] {
  return pumps.filter((p) => p.servicedBlockIds.includes(blockId));
}
