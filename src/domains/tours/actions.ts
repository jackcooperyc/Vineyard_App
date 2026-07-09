"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-session";
import { db } from "@/lib/db";
import {
  createTourPOISchema,
  deleteTourPOISchema,
  relocateTourPOISchema,
  updateTourPOISchema,
} from "@/domains/tours/validators";

function revalidateTourPaths() {
  revalidatePath("/tours");
  revalidatePath("/map");
}

export async function createTourPOI(formData: FormData) {
  const authResult = await requirePermission("tours:manage");
  if ("error" in authResult) return { error: authResult.error };

  const parsed = createTourPOISchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category"),
    lat: formData.get("lat"),
    lng: formData.get("lng"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { title, description, category, lat, lng } = parsed.data;

  const poi = await db.tourPOI.create({
    data: {
      title,
      description: description ?? null,
      category,
      gpsPoint: { type: "Point", coordinates: [lng, lat] },
    },
  });

  revalidateTourPaths();
  return { success: true, poiId: poi.id };
}

export async function updateTourPOI(formData: FormData) {
  const authResult = await requirePermission("tours:manage");
  if ("error" in authResult) return { error: authResult.error };

  const parsed = updateTourPOISchema.safeParse({
    poiId: formData.get("poiId"),
    title: formData.get("title"),
    description: formData.get("description") || undefined,
    category: formData.get("category"),
    lat: formData.get("lat"),
    lng: formData.get("lng"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { poiId, title, description, category, lat, lng } = parsed.data;

  const existing = await db.tourPOI.findUnique({
    where: { id: poiId },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Tour POI not found" };
  }

  await db.tourPOI.update({
    where: { id: poiId },
    data: {
      title,
      description: description ?? null,
      category,
      gpsPoint: { type: "Point", coordinates: [lng, lat] },
    },
  });

  revalidateTourPaths();
  return { success: true, poiId };
}

export async function relocateTourPOI(poiId: string, lat: number, lng: number) {
  const authResult = await requirePermission("tours:manage");
  if ("error" in authResult) return { error: authResult.error };

  const parsed = relocateTourPOISchema.safeParse({ poiId, lat, lng });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await db.tourPOI.findUnique({
    where: { id: parsed.data.poiId },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Tour POI not found" };
  }

  await db.tourPOI.update({
    where: { id: parsed.data.poiId },
    data: {
      gpsPoint: {
        type: "Point",
        coordinates: [parsed.data.lng, parsed.data.lat],
      },
    },
  });

  revalidateTourPaths();
  return { success: true, poiId: parsed.data.poiId };
}

export async function deleteTourPOI(poiId: string) {
  const authResult = await requirePermission("tours:manage");
  if ("error" in authResult) return { error: authResult.error };

  const parsed = deleteTourPOISchema.safeParse({ poiId });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const existing = await db.tourPOI.findUnique({
    where: { id: parsed.data.poiId },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Tour POI not found" };
  }

  await db.tourPOI.delete({ where: { id: parsed.data.poiId } });

  revalidateTourPaths();
  return { success: true };
}
