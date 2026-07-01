"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { createIrrigationPumpSchema } from "@/domains/pumps/validators";

function revalidatePumpPaths(pumpId?: string) {
  revalidatePath("/pumps");
  revalidatePath("/map");
  if (pumpId) {
    revalidatePath(`/pumps/${pumpId}`);
  }
}

export async function createIrrigationPump(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const servicedBlockIds = formData.getAll("servicedBlockIds").map(String);

  const parsed = createIrrigationPumpSchema.safeParse({
    name: formData.get("name"),
    lat: formData.get("lat"),
    lng: formData.get("lng"),
    flowCapacity: formData.get("flowCapacity") || undefined,
    servicedBlockIds,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, lat, lng, flowCapacity, servicedBlockIds: blockIds, notes } =
    parsed.data;

  const pump = await db.irrigationPump.create({
    data: {
      name,
      gpsPoint: { type: "Point", coordinates: [lng, lat] },
      flowCapacity: flowCapacity ?? null,
      servicedBlockIds: blockIds,
      notes: notes ?? null,
    },
  });

  revalidatePumpPaths(pump.id);
  return { success: true, pumpId: pump.id };
}
