"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-session";
import { db } from "@/lib/db";
import {
  createPlantingSchema,
  deletePlantingSchema,
  updateBlockSchema,
  updatePlantingSchema,
} from "@/domains/blocks/validators";

function parseFloatOrNull(value?: string): number | null {
  if (!value?.trim()) return null;
  const n = Number.parseFloat(value);
  return Number.isNaN(n) ? null : n;
}

function parseIntOrNull(value?: string): number | null {
  if (!value?.trim()) return null;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
}

function revalidateBlockPaths(blockId: string) {
  revalidatePath("/blocks");
  revalidatePath(`/blocks/${blockId}`);
  revalidatePath(`/blocks/${blockId}/edit`);
  revalidatePath("/map");
  revalidatePath("/dashboard");
  revalidatePath("/field");
}

export async function updateBlock(formData: FormData) {
  const session = await requirePermission("blocks:edit");
  if ("error" in session) return { error: session.error };

  const parsed = updateBlockSchema.safeParse({
    blockId: formData.get("blockId"),
    name: formData.get("name"),
    status: formData.get("status"),
    acreage: formData.get("acreage") || undefined,
    notes: formData.get("notes") || undefined,
    growthStage: formData.get("growthStage") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { blockId, name, status, acreage, notes, growthStage } = parsed.data;

  const existing = await db.block.findUnique({
    where: { id: blockId },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Block not found" };
  }

  await db.block.update({
    where: { id: blockId },
    data: {
      name,
      status,
      acreage: parseFloatOrNull(acreage),
      notes: notes?.trim() || null,
      growthStage: growthStage ?? null,
    },
  });

  revalidateBlockPaths(blockId);
  return { success: true, blockId };
}

export async function createPlanting(formData: FormData) {
  const session = await requirePermission("blocks:edit");
  if ("error" in session) return { error: session.error };

  const parsed = createPlantingSchema.safeParse({
    blockId: formData.get("blockId"),
    varietyId: formData.get("varietyId"),
    vineCount: formData.get("vineCount") || undefined,
    yearPlanted: formData.get("yearPlanted") || undefined,
    rootstock: formData.get("rootstock") || undefined,
    rowSpacing: formData.get("rowSpacing") || undefined,
    vineSpacing: formData.get("vineSpacing") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  const planting = await db.planting.create({
    data: {
      blockId: data.blockId,
      varietyId: data.varietyId,
      vineCount: parseIntOrNull(data.vineCount),
      yearPlanted: parseIntOrNull(data.yearPlanted),
      rootstock: data.rootstock?.trim() || null,
      rowSpacing: parseFloatOrNull(data.rowSpacing),
      vineSpacing: parseFloatOrNull(data.vineSpacing),
    },
  });

  revalidateBlockPaths(data.blockId);
  return { success: true, plantingId: planting.id };
}

export async function updatePlanting(formData: FormData) {
  const session = await requirePermission("blocks:edit");
  if ("error" in session) return { error: session.error };

  const parsed = updatePlantingSchema.safeParse({
    blockId: formData.get("blockId"),
    plantingId: formData.get("plantingId"),
    varietyId: formData.get("varietyId"),
    vineCount: formData.get("vineCount") || undefined,
    yearPlanted: formData.get("yearPlanted") || undefined,
    rootstock: formData.get("rootstock") || undefined,
    rowSpacing: formData.get("rowSpacing") || undefined,
    vineSpacing: formData.get("vineSpacing") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { blockId, plantingId, varietyId, vineCount, yearPlanted, rootstock, rowSpacing, vineSpacing } =
    parsed.data;

  const existing = await db.planting.findFirst({
    where: { id: plantingId, blockId },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Planting not found" };
  }

  await db.planting.update({
    where: { id: plantingId },
    data: {
      varietyId,
      vineCount: parseIntOrNull(vineCount),
      yearPlanted: parseIntOrNull(yearPlanted),
      rootstock: rootstock?.trim() || null,
      rowSpacing: parseFloatOrNull(rowSpacing),
      vineSpacing: parseFloatOrNull(vineSpacing),
    },
  });

  revalidateBlockPaths(blockId);
  return { success: true };
}

export async function deletePlanting(formData: FormData) {
  const session = await requirePermission("blocks:edit");
  if ("error" in session) return { error: session.error };

  const parsed = deletePlantingSchema.safeParse({
    plantingId: formData.get("plantingId"),
    blockId: formData.get("blockId"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { plantingId, blockId } = parsed.data;

  const existing = await db.planting.findFirst({
    where: { id: plantingId, blockId },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Planting not found" };
  }

  await db.planting.delete({ where: { id: plantingId } });

  revalidateBlockPaths(blockId);
  return { success: true };
}
