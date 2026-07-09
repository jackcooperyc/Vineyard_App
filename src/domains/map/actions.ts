"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-session";
import { db } from "@/lib/db";
import {
  USER_MAP_SPACE_CODE_PREFIX,
  USER_MAP_SPACE_COLOR_HEX,
  isUserMapSpace,
} from "@/domains/map/constants";
import {
  createMapSpaceSchema,
  deleteMapSpaceSchema,
  updateMapSpaceSchema,
} from "@/domains/map/validators";
import type { MapBlockGeometry } from "@/domains/map/types";
import {
  polygonCentroid,
  polygonMetrics,
  slugifyMapSpaceCode,
} from "@/lib/maps/geometry";

function revalidateMapPaths(blockId?: string) {
  revalidatePath("/map");
  revalidatePath("/blocks");
  if (blockId) {
    revalidatePath(`/blocks/${blockId}`);
  }
}

async function getDefaultVineyardId(): Promise<string | null> {
  const vineyard = await db.vineyard.findFirst({ select: { id: true } });
  return vineyard?.id ?? null;
}

async function assertUserMapSpace(blockId: string) {
  const block = await db.block.findUnique({
    where: { id: blockId },
    select: { id: true, code: true, blockType: true },
  });

  if (!block) {
    return { error: "Map space not found" as const };
  }

  if (block.blockType !== "INFRASTRUCTURE" || !isUserMapSpace(block.code)) {
    return { error: "Only custom map spaces can be edited here" as const };
  }

  return { block };
}

function buildMapSpaceData(geometry: MapBlockGeometry) {
  const { lat, lng } = polygonCentroid(geometry);
  const metrics = polygonMetrics(geometry);

  return {
    centerLat: lat,
    centerLng: lng,
    geometry,
    acreage: metrics.acreage,
    areaSqm: metrics.areaSqm,
    perimeterM: metrics.perimeterM,
  };
}

async function generateUniqueCode(name: string, vineyardId: string): Promise<string> {
  const base = `${USER_MAP_SPACE_CODE_PREFIX}${slugifyMapSpaceCode(name)}`;
  let code = base;
  let suffix = 1;

  while (await db.block.findFirst({ where: { vineyardId, code } })) {
    suffix += 1;
    code = `${base}-${suffix}`;
  }

  return code;
}

export async function createMapSpace(input: {
  name: string;
  category: string;
  geometry: MapBlockGeometry;
}) {
  const session = await requirePermission("blocks:edit");
  if ("error" in session) return { error: session.error };

  const parsed = createMapSpaceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const vineyardId = await getDefaultVineyardId();
  if (!vineyardId) {
    return { error: "No vineyard configured" };
  }

  const { name, category, geometry } = parsed.data;
  const code = await generateUniqueCode(name, vineyardId);
  const spaceData = buildMapSpaceData(geometry);

  const block = await db.block.create({
    data: {
      vineyardId,
      code,
      name,
      blockType: "INFRASTRUCTURE",
      infrastructureType: category,
      status: "ACTIVE",
      colorHex: USER_MAP_SPACE_COLOR_HEX,
      acreage: spaceData.acreage,
      areaSqm: spaceData.areaSqm,
      perimeterM: spaceData.perimeterM,
      mapFeature: {
        create: {
          geometry: spaceData.geometry,
          centerLat: spaceData.centerLat,
          centerLng: spaceData.centerLng,
        },
      },
    },
    select: { id: true, code: true },
  });

  revalidateMapPaths(block.id);
  return { success: true, blockId: block.id, code: block.code };
}

export async function updateMapSpace(input: {
  blockId: string;
  name: string;
  category: string;
  geometry?: MapBlockGeometry;
}) {
  const session = await requirePermission("blocks:edit");
  if ("error" in session) return { error: session.error };

  const parsed = updateMapSpaceSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const check = await assertUserMapSpace(parsed.data.blockId);
  if ("error" in check) return { error: check.error };

  const { blockId, name, category, geometry } = parsed.data;

  if (geometry) {
    const spaceData = buildMapSpaceData(geometry);
    await db.$transaction([
      db.block.update({
        where: { id: blockId },
        data: {
          name,
          infrastructureType: category,
          acreage: spaceData.acreage,
          areaSqm: spaceData.areaSqm,
          perimeterM: spaceData.perimeterM,
        },
      }),
      db.mapFeature.update({
        where: { blockId },
        data: {
          geometry: spaceData.geometry,
          centerLat: spaceData.centerLat,
          centerLng: spaceData.centerLng,
        },
      }),
    ]);
  } else {
    await db.block.update({
      where: { id: blockId },
      data: {
        name,
        infrastructureType: category,
      },
    });
  }

  revalidateMapPaths(blockId);
  return { success: true, blockId };
}

export async function deleteMapSpace(blockId: string) {
  const session = await requirePermission("blocks:edit");
  if ("error" in session) return { error: session.error };

  const parsed = deleteMapSpaceSchema.safeParse({ blockId });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const check = await assertUserMapSpace(parsed.data.blockId);
  if ("error" in check) return { error: check.error };

  await db.block.delete({ where: { id: parsed.data.blockId } });

  revalidateMapPaths();
  return { success: true };
}
