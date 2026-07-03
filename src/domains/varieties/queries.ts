import { db } from "@/lib/db";
import type { MapColorMode, VarietyColor } from "@/generated/prisma/client";

export type VarietySettingsItem = {
  id: string;
  name: string;
  color: VarietyColor | null;
  colorHex: string | null;
  plantingCount: number;
};

export type VarietyLegendItem = {
  id: string;
  name: string;
  color: VarietyColor | null;
  colorHex: string;
  plantingCount: number;
};

export async function getVarietiesForSettings(): Promise<VarietySettingsItem[]> {
  const rows = await db.variety.findMany({
    orderBy: { name: "asc" },
    include: {
      _count: { select: { plantings: true } },
    },
  });

  return rows.map((v) => ({
    id: v.id,
    name: v.name,
    color: v.color,
    colorHex: v.colorHex,
    plantingCount: v._count.plantings,
  }));
}

export async function getVarietyLegendItems(): Promise<VarietyLegendItem[]> {
  const rows = await db.variety.findMany({
    where: {
      plantings: { some: {} },
    },
    orderBy: { name: "asc" },
    include: {
      _count: { select: { plantings: true } },
    },
  });

  return rows
    .filter((v) => v._count.plantings > 0)
    .map((v) => ({
      id: v.id,
      name: v.name,
      color: v.color,
      colorHex: v.colorHex ?? "#6b7280",
      plantingCount: v._count.plantings,
    }));
}

export async function getVineyardMapColorMode(): Promise<MapColorMode> {
  const vineyard = await db.vineyard.findFirst({
    select: { mapColorMode: true },
  });
  return vineyard?.mapColorMode ?? "STATUS";
}
