"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import type { EquipmentStatus } from "@/generated/prisma/client";
import {
  createEquipmentSchema,
  createMaintenanceRecordSchema,
  updateEquipmentSchema,
  updateEquipmentStatusSchema,
  updateMaintenanceRecordSchema,
} from "@/domains/equipment/validators";
import { notDeletedWhere } from "@/lib/soft-delete";
import { purgeExpiredSoftDeletes } from "@/lib/soft-delete-purge";

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function revalidateEquipmentPaths(equipmentId?: string) {
  revalidatePath("/equipment");
  revalidatePath("/dashboard");
  revalidatePath("/tasks");
  if (equipmentId) {
    revalidatePath(`/equipment/${equipmentId}`);
  }
}

export async function createEquipment(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const parsed = createEquipmentSchema.safeParse({
    name: formData.get("name"),
    type: formData.get("type"),
    status: formData.get("status") || "ACTIVE",
    serialNumber: formData.get("serialNumber") || undefined,
    lastServicedAt: formData.get("lastServicedAt") || undefined,
    nextServiceAt: formData.get("nextServiceAt") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const equipment = await db.equipment.create({
    data: {
      name: data.name,
      type: data.type,
      status: data.status,
      serialNumber: data.serialNumber,
      lastServicedAt: parseDate(data.lastServicedAt),
      nextServiceAt: parseDate(data.nextServiceAt),
      notes: data.notes,
    },
  });

  revalidateEquipmentPaths(equipment.id);
  return { success: true, equipmentId: equipment.id };
}

export async function createMaintenanceRecord(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const parsed = createMaintenanceRecordSchema.safeParse({
    equipmentId: formData.get("equipmentId"),
    performedAt: formData.get("performedAt"),
    description: formData.get("description") || undefined,
    notes: formData.get("notes") || undefined,
    nextServiceAt: formData.get("nextServiceAt") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { equipmentId, performedAt, description, notes, nextServiceAt } =
    parsed.data;

  const performedDate = parseDate(performedAt);
  if (!performedDate) {
    return { error: "Invalid service date" };
  }

  const nextDate = parseDate(nextServiceAt);

  await db.$transaction([
    db.maintenanceRecord.create({
      data: {
        equipmentId,
        performedAt: performedDate,
        description,
        notes,
      },
    }),
    db.equipment.update({
      where: { id: equipmentId },
      data: {
        lastServicedAt: performedDate,
        ...(nextDate ? { nextServiceAt: nextDate } : {}),
        status: "ACTIVE",
      },
    }),
  ]);

  revalidateEquipmentPaths(equipmentId);
  return { success: true };
}

export async function updateEquipment(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const parsed = updateEquipmentSchema.safeParse({
    equipmentId: formData.get("equipmentId"),
    name: formData.get("name"),
    type: formData.get("type"),
    status: formData.get("status") || "ACTIVE",
    serialNumber: formData.get("serialNumber") || undefined,
    lastServicedAt: formData.get("lastServicedAt") || undefined,
    nextServiceAt: formData.get("nextServiceAt") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const {
    equipmentId,
    name,
    type,
    status,
    serialNumber,
    lastServicedAt,
    nextServiceAt,
    notes,
  } = parsed.data;

  const existing = await db.equipment.findFirst({
    where: { id: equipmentId, ...notDeletedWhere() },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Equipment not found" };
  }

  await db.equipment.update({
    where: { id: equipmentId },
    data: {
      name,
      type,
      status,
      serialNumber: serialNumber || null,
      lastServicedAt: parseDate(lastServicedAt) ?? null,
      nextServiceAt: parseDate(nextServiceAt) ?? null,
      notes: notes || null,
    },
  });

  revalidateEquipmentPaths(equipmentId);
  revalidatePath(`/equipment/${equipmentId}/edit`);
  return { success: true, equipmentId };
}

export async function updateEquipmentStatus(
  equipmentId: string,
  status: EquipmentStatus,
) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const parsed = updateEquipmentStatusSchema.safeParse({ equipmentId, status });
  if (!parsed.success) {
    return { error: "Invalid status update" };
  }

  const existing = await db.equipment.findFirst({
    where: { id: equipmentId, ...notDeletedWhere() },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Equipment not found" };
  }

  await db.equipment.update({
    where: { id: equipmentId },
    data: { status },
  });

  revalidateEquipmentPaths(equipmentId);
  return { success: true };
}

export async function retireEquipment(equipmentId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const existing = await db.equipment.findFirst({
    where: { id: equipmentId, ...notDeletedWhere() },
    select: { id: true, status: true },
  });

  if (!existing) {
    return { error: "Equipment not found" };
  }

  if (existing.status === "RETIRED") {
    return { error: "Equipment is already retired" };
  }

  await db.equipment.update({
    where: { id: equipmentId },
    data: { status: "RETIRED" },
  });

  revalidateEquipmentPaths(equipmentId);
  return { success: true };
}

export async function updateMaintenanceRecord(formData: FormData) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const parsed = updateMaintenanceRecordSchema.safeParse({
    recordId: formData.get("recordId"),
    equipmentId: formData.get("equipmentId"),
    performedAt: formData.get("performedAt"),
    description: formData.get("description") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { recordId, equipmentId, performedAt, description, notes } = parsed.data;
  const performedDate = parseDate(performedAt);
  if (!performedDate) {
    return { error: "Invalid service date" };
  }

  const existing = await db.maintenanceRecord.findFirst({
    where: { id: recordId, equipmentId, ...notDeletedWhere() },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Maintenance record not found" };
  }

  await db.maintenanceRecord.update({
    where: { id: recordId },
    data: {
      performedAt: performedDate,
      description: description || null,
      notes: notes || null,
    },
  });

  revalidateEquipmentPaths(equipmentId);
  return { success: true };
}

export async function deleteMaintenanceRecord(
  recordId: string,
  equipmentId: string,
) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  await purgeExpiredSoftDeletes();

  const existing = await db.maintenanceRecord.findFirst({
    where: { id: recordId, equipmentId, ...notDeletedWhere() },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Maintenance record not found" };
  }

  await db.maintenanceRecord.update({
    where: { id: recordId },
    data: { deletedAt: new Date() },
  });

  revalidateEquipmentPaths(equipmentId);
  return { success: true };
}

export async function deleteEquipment(equipmentId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  await purgeExpiredSoftDeletes();

  const existing = await db.equipment.findFirst({
    where: { id: equipmentId, ...notDeletedWhere() },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Equipment not found" };
  }

  await db.equipment.update({
    where: { id: equipmentId },
    data: { deletedAt: new Date() },
  });

  revalidateEquipmentPaths(equipmentId);
  return { success: true };
}

export async function restoreEquipment(equipmentId: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  await purgeExpiredSoftDeletes();

  const existing = await db.equipment.findFirst({
    where: { id: equipmentId, deletedAt: { not: null } },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Deleted equipment not found" };
  }

  await db.equipment.update({
    where: { id: equipmentId },
    data: { deletedAt: null },
  });

  revalidateEquipmentPaths(equipmentId);
  return { success: true };
}

export async function restoreMaintenanceRecord(
  recordId: string,
  equipmentId: string,
) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  await purgeExpiredSoftDeletes();

  const existing = await db.maintenanceRecord.findFirst({
    where: { id: recordId, equipmentId, deletedAt: { not: null } },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Deleted maintenance record not found" };
  }

  await db.maintenanceRecord.update({
    where: { id: recordId },
    data: { deletedAt: null },
  });

  revalidateEquipmentPaths(equipmentId);
  return { success: true };
}
