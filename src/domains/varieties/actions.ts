"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-session";
import { db } from "@/lib/db";
import {
  updateMapColorModeSchema,
  updateVarietyColorSchema,
} from "@/domains/varieties/validators";

export async function updateVarietyColor(formData: FormData) {
  const authResult = await requirePermission("varieties:manage");
  if ("error" in authResult) return { error: authResult.error };

  const parsed = updateVarietyColorSchema.safeParse({
    varietyId: formData.get("varietyId"),
    colorHex: formData.get("colorHex"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid color" };
  }

  await db.variety.update({
    where: { id: parsed.data.varietyId },
    data: { colorHex: parsed.data.colorHex },
  });

  revalidatePath("/blocks", "layout");
  revalidatePath("/map");
  return { success: true };
}

export async function updateVineyardMapColorMode(mapColorMode: "STATUS" | "VARIETAL") {
  const authResult = await requirePermission("varieties:manage");
  if ("error" in authResult) return { error: authResult.error };

  const parsed = updateMapColorModeSchema.safeParse({ mapColorMode });
  if (!parsed.success) return { error: "Invalid map color mode" };

  const vineyard = await db.vineyard.findFirst({ select: { id: true } });
  if (!vineyard) return { error: "Vineyard not found" };

  await db.vineyard.update({
    where: { id: vineyard.id },
    data: { mapColorMode: parsed.data.mapColorMode },
  });

  revalidatePath("/map");
  revalidatePath("/blocks");
  return { success: true };
}
