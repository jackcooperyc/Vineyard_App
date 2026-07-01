/**
 * Cooper Estate real block data loader for prisma seed.
 */

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import type {
  BlockType,
  GrowthStage,
  PrismaClient,
  VarietyColor,
} from "../src/generated/prisma/client";

export const ESTATE_CENTER = { lat: 46.26513, lng: -119.45518 };

const SQFT_PER_ACRE = 4046.8564224;

type SourceBlock = {
  sort: number;
  code: string;
  name: string;
  varietal: string;
  acres: number;
  elevation_m: { min: number; med: number; max: number } | null;
  growth_stage: string | null;
  irrigation_events: number;
  irrigation_last: string | null;
  _flag?: string;
  _sample_verified?: string;
};

type SourceInfrastructure = {
  name: string;
  type: string;
  acres: number | null;
  elevation_m: { min: number; med: number; max: number } | null;
  _flag?: string;
};

type SourceData = {
  vineyard: { name: string; location: string; center: { lat: number; lng: number } };
  varieties: Array<{ name: string; color: "RED" | "WHITE" }>;
  blocks: SourceBlock[];
  infrastructure_areas: SourceInfrastructure[];
};

type GeometryFeature = {
  kmlName: string;
  matchKey: string;
  geometry: { type: "Polygon"; coordinates: number[][][] };
  centerLat: number;
  centerLng: number;
  vertexCount: number;
};

type GeometryData = {
  features: GeometryFeature[];
};

function dataPath(filename: string) {
  return resolve(import.meta.dirname, "data", filename);
}

function loadJson<T>(filename: string): T {
  return JSON.parse(readFileSync(dataPath(filename), "utf-8")) as T;
}

function slugCode(name: string): string {
  return name
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildGeometryLookup(features: GeometryFeature[]) {
  const byKey = new Map<string, GeometryFeature>();
  for (const feature of features) {
    byKey.set(feature.matchKey, feature);
    byKey.set(feature.kmlName, feature);
    byKey.set(feature.matchKey.replace(/\s+/g, ""), feature);
  }
  return byKey;
}

function parseGrowthStage(value: string | null): GrowthStage | null {
  if (!value) return null;
  if (value.toLowerCase() === "dormant") return "DORMANT";
  return null;
}

function buildNotes(...parts: Array<string | undefined>): string | null {
  const joined = parts.filter(Boolean).join(" | ");
  return joined || null;
}

export function loadEstateSourceFiles() {
  const source = loadJson<SourceData>("cooper-estate-blocks.v1.json");
  const geometry = loadJson<GeometryData>("geometry.json");
  return { source, geometry };
}

export async function seedEstateBlocks(
  prisma: PrismaClient,
  vineyardId: string,
  adminId: string,
) {
  const { source, geometry } = loadEstateSourceFiles();
  const geometryByKey = buildGeometryLookup(geometry.features);

  await prisma.block.deleteMany({ where: { vineyardId } });

  const varietyRecords = await Promise.all(
    source.varieties.map((v) =>
      prisma.variety.upsert({
        where: { name: v.name },
        update: { color: v.color as VarietyColor },
        create: { name: v.name, color: v.color as VarietyColor },
      }),
    ),
  );
  const varietyByName = Object.fromEntries(
    varietyRecords.map((v) => [v.name, v]),
  );

  const blockByCode: Record<string, string> = {};
  const missingGeometry: string[] = [];

  for (const block of source.blocks) {
    const geo = geometryByKey.get(block.name);
    if (!geo) missingGeometry.push(block.name);

    const areaSqm = block.acres > 0 ? block.acres * SQFT_PER_ACRE : null;

    const created = await prisma.block.create({
      data: {
        vineyardId,
        code: block.code,
        name: block.name,
        blockType: "VINEYARD",
        acreage: block.acres,
        areaSqm,
        elevMin: block.elevation_m?.min ?? null,
        elevMed: block.elevation_m?.med ?? null,
        elevMax: block.elevation_m?.max ?? null,
        growthStage: parseGrowthStage(block.growth_stage),
        status: "ACTIVE",
        notes: buildNotes(block._flag, block._sample_verified),
        plantings: {
          create: {
            varietyId: varietyByName[block.varietal].id,
            vineCount: null,
            yearPlanted: null,
            rootstock: null,
          },
        },
        ...(geo
          ? {
              mapFeature: {
                create: {
                  geometry: geo.geometry,
                  centerLat: geo.centerLat,
                  centerLng: geo.centerLng,
                },
              },
            }
          : {}),
      },
    });

    blockByCode[block.code] = created.id;

    if (block._flag) {
      await prisma.note.create({
        data: {
          blockId: created.id,
          authorId: adminId,
          content: `Import flag: ${block._flag}`,
        },
      });
    }
  }

  for (const area of source.infrastructure_areas) {
    const geo =
      geometryByKey.get(area.name) ??
      geometryByKey.get(area.name.replace("Vineard", "Vineyard"));
    if (!geo) missingGeometry.push(area.name);

    const code = `INF-${slugCode(area.name)}`;
    const areaSqm =
      area.acres != null && area.acres > 0 ? area.acres * SQFT_PER_ACRE : null;

    const created = await prisma.block.create({
      data: {
        vineyardId,
        code,
        name: area.name,
        blockType: "INFRASTRUCTURE" as BlockType,
        infrastructureType: area.type,
        acreage: area.acres,
        areaSqm,
        elevMin: area.elevation_m?.min ?? null,
        elevMed: area.elevation_m?.med ?? null,
        elevMax: area.elevation_m?.max ?? null,
        status: "ACTIVE",
        notes: buildNotes(
          area._flag,
          area.name === "Vineard RV Park"
            ? "Display name preserved from source; likely typo for Vineyard RV Park."
            : undefined,
        ),
        ...(geo
          ? {
              mapFeature: {
                create: {
                  geometry: geo.geometry,
                  centerLat: geo.centerLat,
                  centerLng: geo.centerLng,
                },
              },
            }
          : {}),
      },
    });

    blockByCode[code] = created.id;
  }

  const irrigationDate = new Date("2026-04-14T12:00:00.000Z");
  const importedRecordNote =
    "Imported from Cooper Estate source-of-truth (2026-04-14).";
  for (const code of ["3", "31", "32"] as const) {
    const blockId = blockByCode[code];
    if (!blockId) continue;
    const existing = await prisma.irrigationRecord.findFirst({
      where: { blockId, notes: importedRecordNote },
    });
    if (!existing) {
      await prisma.irrigationRecord.create({
        data: {
          blockId,
          appliedAt: irrigationDate,
          status: "APPLIED",
          method: "Drip",
          notes: importedRecordNote,
        },
      });
    }
  }

  return {
    source,
    blockByCode,
    missingGeometry,
    vineyardBlockCount: source.blocks.length,
    infrastructureCount: source.infrastructure_areas.length,
    geometryCount: geometry.features.length,
  };
}
