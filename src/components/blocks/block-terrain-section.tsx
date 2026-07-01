import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { GrowthStage } from "@/generated/prisma/client";

type TerrainBlock = {
  blockType: "VINEYARD" | "INFRASTRUCTURE";
  infrastructureType: string | null;
  acreage: number | null;
  areaSqm: number | null;
  perimeterM: number | null;
  elevMin: number | null;
  elevMed: number | null;
  elevMax: number | null;
  growthStage: GrowthStage | null;
  colorHex: string | null;
};

type ViticultureMetricsData = {
  currentNdviScore: number | null;
  cumulativeGdd: number | null;
  lastSatellitePass: Date | null;
} | null;

function formatGrowthStage(stage: GrowthStage | null): string {
  if (!stage) return "Not recorded";
  return stage.charAt(0) + stage.slice(1).toLowerCase();
}

function formatArea(areaSqm: number | null): string | null {
  if (areaSqm == null) return null;
  const acres = areaSqm / 4046.86;
  return `${areaSqm.toLocaleString(undefined, { maximumFractionDigits: 1 })} m² (${acres.toFixed(2)} ac calc.)`;
}

function TerrainRow({ label, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-3 last:border-0 last:pb-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium">{value}</span>
    </div>
  );
}

export function BlockTerrainSection({
  block,
  viticultureMetrics,
}: {
  block: TerrainBlock;
  viticultureMetrics: ViticultureMetricsData;
}) {
  const isInfrastructure = block.blockType === "INFRASTRUCTURE";
  const elevationParts = [
    block.elevMin != null ? `${block.elevMin.toFixed(1)} min` : null,
    block.elevMed != null ? `${block.elevMed.toFixed(1)} med` : null,
    block.elevMax != null ? `${block.elevMax.toFixed(1)} max` : null,
  ].filter(Boolean);

  const hasTerrain =
    block.acreage != null ||
    block.areaSqm != null ||
    block.perimeterM != null ||
    elevationParts.length > 0 ||
    block.growthStage != null ||
    block.colorHex != null ||
    isInfrastructure;

  if (!hasTerrain) return null;

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>{isInfrastructure ? "Site details" : "Terrain"}</CardTitle>
          <CardDescription>
            {isInfrastructure
              ? "Infrastructure area measurements from GIS import"
              : "Elevation, acreage, and growth stage from GIS import"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isInfrastructure && block.infrastructureType && (
            <TerrainRow label="Type" value={block.infrastructureType} />
          )}
          <TerrainRow
            label="Acreage"
            value={
              block.acreage != null ? `${block.acreage.toFixed(2)} acres` : null
            }
          />
          <TerrainRow label="Area" value={formatArea(block.areaSqm)} />
          <TerrainRow
            label="Perimeter"
            value={
              block.perimeterM != null
                ? `${block.perimeterM.toLocaleString(undefined, { maximumFractionDigits: 1 })} m`
                : null
            }
          />
          <TerrainRow
            label="Elevation (m)"
            value={
              elevationParts.length > 0 ? elevationParts.join(" · ") : null
            }
          />
          {!isInfrastructure && (
            <TerrainRow
              label="Growth stage"
              value={formatGrowthStage(block.growthStage)}
            />
          )}
          {block.colorHex && (
            <div className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 last:border-0 last:pb-0">
              <span className="text-sm text-muted-foreground">Map color</span>
              <span className="flex items-center gap-2 text-sm font-medium">
                <span
                  className="size-4 rounded border"
                  style={{ backgroundColor: block.colorHex }}
                  aria-hidden
                />
                {block.colorHex}
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {!isInfrastructure && (
        <Card>
          <CardHeader>
            <CardTitle>Satellite metrics</CardTitle>
            <CardDescription>NDVI and GDD — Sprint 9+ integration</CardDescription>
          </CardHeader>
          <CardContent>
            {viticultureMetrics &&
            (viticultureMetrics.currentNdviScore != null ||
              viticultureMetrics.cumulativeGdd != null ||
              viticultureMetrics.lastSatellitePass != null) ? (
              <div className="space-y-3">
                {viticultureMetrics.currentNdviScore != null && (
                  <TerrainRow
                    label="NDVI score"
                    value={viticultureMetrics.currentNdviScore.toFixed(3)}
                  />
                )}
                {viticultureMetrics.cumulativeGdd != null && (
                  <TerrainRow
                    label="Cumulative GDD"
                    value={viticultureMetrics.cumulativeGdd.toFixed(1)}
                  />
                )}
                {viticultureMetrics.lastSatellitePass != null && (
                  <TerrainRow
                    label="Last satellite pass"
                    value={viticultureMetrics.lastSatellitePass.toLocaleDateString()}
                  />
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">
                Satellite metrics not connected. Earth Engine integration planned
                for a future sprint.
              </p>
            )}
          </CardContent>
        </Card>
      )}
    </>
  );
}
