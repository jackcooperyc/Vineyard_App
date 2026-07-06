"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-session";
import { db } from "@/lib/db";
import length from "@turf/length";
import { lineString } from "@turf/helpers";
import { z } from "zod";

const importRowsSchema = z.object({
  blockId: z.string().min(1),
  rows: z.array(
    z.object({
      rowIndex: z.number().int().min(1),
      coordinates: z.array(z.tuple([z.number(), z.number()])).min(2),
    }),
  ),
});

export async function getBlockRows(blockId: string) {
  return db.blockRow.findMany({
    where: { blockId },
    orderBy: { rowIndex: "asc" },
  });
}

export async function getBlockRowLayoutStatus(blockId: string) {
  const count = await db.blockRow.count({ where: { blockId } });
  const planting = await db.planting.findFirst({
    where: { blockId },
    select: { rowSpacing: true, vineSpacing: true },
  });
  if (count > 0) return { status: "gis" as const, rowCount: count };
  if (planting?.rowSpacing != null) {
    return { status: "spacing_only" as const, rowCount: 0 };
  }
  return { status: "none" as const, rowCount: 0 };
}

export async function importBlockRows(input: {
  blockId: string;
  rows: { rowIndex: number; coordinates: [number, number][] }[];
}) {
  const authResult = await requirePermission("import:data");
  if ("error" in authResult) return { error: authResult.error };

  const parsed = importRowsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid row data" };
  }

  const block = await db.block.findUnique({
    where: { id: parsed.data.blockId },
    select: { id: true },
  });
  if (!block) return { error: "Block not found" };

  await db.$transaction(async (tx) => {
    await tx.blockRow.deleteMany({ where: { blockId: parsed.data.blockId } });
    for (const row of parsed.data.rows) {
      const geometry = { type: "LineString", coordinates: row.coordinates };
      const line = lineString(row.coordinates);
      const lengthM = length(line, { units: "meters" });
      await tx.blockRow.create({
        data: {
          blockId: parsed.data.blockId,
          rowIndex: row.rowIndex,
          geometry,
          lengthM,
        },
      });
    }
  });

  revalidatePath(`/blocks/${parsed.data.blockId}`);
  return { success: true, count: parsed.data.rows.length };
}

export async function updateBlockSpacing(input: {
  blockId: string;
  rowSpacing?: number;
  vineSpacing?: number;
}) {
  const authResult = await requirePermission("blocks:edit");
  if ("error" in authResult) return { error: authResult.error };

  const planting = await db.planting.findFirst({
    where: { blockId: input.blockId },
  });
  if (!planting) return { error: "No planting record for this block" };

  await db.planting.update({
    where: { id: planting.id },
    data: {
      rowSpacing: input.rowSpacing ?? planting.rowSpacing,
      vineSpacing: input.vineSpacing ?? planting.vineSpacing,
    },
  });

  revalidatePath(`/blocks/${input.blockId}`);
  return { success: true };
}
