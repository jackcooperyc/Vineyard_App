"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  createRecordSchema,
  createScheduleSchema,
  quickLogRecordSchema,
  updateRecordSchema,
  updateScheduleSchema,
} from "@/domains/irrigation/validators";

function parseDate(value?: string): Date | undefined {
  if (!value) return undefined;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? undefined : date;
}

function parseFloatOrNull(value?: string): number | null {
  if (!value) return null;
  const n = Number.parseFloat(value);
  return Number.isNaN(n) ? null : n;
}

function parseIntOrNull(value?: string): number | null {
  if (!value) return null;
  const n = Number.parseInt(value, 10);
  return Number.isNaN(n) ? null : n;
}

function revalidateIrrigationPaths(blockId?: string) {
  revalidatePath("/irrigation");
  revalidatePath("/dashboard");
  revalidatePath("/field");
  revalidatePath("/map");
  if (blockId) {
    revalidatePath(`/blocks/${blockId}`);
  }
}

function revalidateSchedulePaths(scheduleId: string, blockId: string) {
  revalidateIrrigationPaths(blockId);
  revalidatePath(`/irrigation/schedules/${scheduleId}`);
  revalidatePath(`/irrigation/schedules/${scheduleId}/edit`);
}

export async function createIrrigationSchedule(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = createScheduleSchema.safeParse({
    blockId: formData.get("blockId"),
    frequency: formData.get("frequency"),
    startDate: formData.get("startDate"),
    volume: formData.get("volume") || undefined,
    method: formData.get("method") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { blockId, frequency, startDate, volume, method, notes } = parsed.data;
  const start = parseDate(startDate);
  if (!start) return { error: "Invalid start date" };

  const schedule = await db.irrigationSchedule.create({
    data: {
      blockId,
      frequency,
      startDate: start,
      volume: parseFloatOrNull(volume),
      method: method || null,
      notes,
      active: true,
    },
  });

  revalidateIrrigationPaths(blockId);
  return { success: true, scheduleId: schedule.id };
}

export async function createIrrigationRecord(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = createRecordSchema.safeParse({
    blockId: formData.get("blockId"),
    appliedAt: formData.get("appliedAt"),
    scheduledAt: formData.get("scheduledAt") || undefined,
    volume: formData.get("volume") || undefined,
    duration: formData.get("duration") || undefined,
    method: formData.get("method") || undefined,
    status: formData.get("status") || "APPLIED",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const appliedAt = parseDate(data.appliedAt);
  if (!appliedAt) return { error: "Invalid application date" };

  const record = await db.irrigationRecord.create({
    data: {
      blockId: data.blockId,
      appliedAt,
      scheduledAt: parseDate(data.scheduledAt),
      volume: parseFloatOrNull(data.volume),
      duration: parseIntOrNull(data.duration),
      method: data.method || null,
      status: data.status,
      notes: data.notes,
    },
  });

  revalidateIrrigationPaths(data.blockId);
  return { success: true, recordId: record.id };
}

export async function quickLogIrrigation(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const blockId = formData.get("blockId") as string;

  const parsed = quickLogRecordSchema.safeParse({
    blockId,
    appliedAt: formData.get("appliedAt") || undefined,
    volume: formData.get("volume") || undefined,
    duration: formData.get("duration") || undefined,
    method: formData.get("method") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { volume, duration, method, notes } = parsed.data;
  const appliedAt = parseDate(parsed.data.appliedAt) ?? new Date();

  const record = await db.irrigationRecord.create({
    data: {
      blockId,
      appliedAt,
      volume: parseFloatOrNull(volume),
      duration: parseIntOrNull(duration),
      method: method || "Drip",
      status: "APPLIED",
      notes,
    },
  });

  revalidateIrrigationPaths(blockId);
  return { success: true, recordId: record.id };
}

export async function toggleScheduleActive(scheduleId: string, active: boolean) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const existing = await db.irrigationSchedule.findUnique({
    where: { id: scheduleId },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Schedule not found" };
  }

  const schedule = await db.irrigationSchedule.update({
    where: { id: scheduleId },
    data: { active },
    select: { blockId: true },
  });

  revalidateSchedulePaths(scheduleId, schedule.blockId);
  return { success: true };
}

export async function updateSchedule(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = updateScheduleSchema.safeParse({
    scheduleId: formData.get("scheduleId"),
    blockId: formData.get("blockId"),
    frequency: formData.get("frequency"),
    startDate: formData.get("startDate"),
    volume: formData.get("volume") || undefined,
    method: formData.get("method") || undefined,
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { scheduleId, blockId, frequency, startDate, volume, method, notes } =
    parsed.data;
  const start = parseDate(startDate);
  if (!start) return { error: "Invalid start date" };

  const existing = await db.irrigationSchedule.findUnique({
    where: { id: scheduleId },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Schedule not found" };
  }

  await db.irrigationSchedule.update({
    where: { id: scheduleId },
    data: {
      blockId,
      frequency,
      startDate: start,
      volume: parseFloatOrNull(volume),
      method: method || null,
      notes: notes || null,
    },
  });

  revalidateSchedulePaths(scheduleId, blockId);
  return { success: true, scheduleId };
}

export async function updateIrrigationRecord(formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = updateRecordSchema.safeParse({
    recordId: formData.get("recordId"),
    blockId: formData.get("blockId"),
    appliedAt: formData.get("appliedAt"),
    scheduledAt: formData.get("scheduledAt") || undefined,
    volume: formData.get("volume") || undefined,
    duration: formData.get("duration") || undefined,
    method: formData.get("method") || undefined,
    status: formData.get("status") || "APPLIED",
    notes: formData.get("notes") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const appliedAt = parseDate(data.appliedAt);
  if (!appliedAt) return { error: "Invalid application date" };

  const existing = await db.irrigationRecord.findUnique({
    where: { id: data.recordId },
    select: { id: true },
  });

  if (!existing) {
    return { error: "Record not found" };
  }

  await db.irrigationRecord.update({
    where: { id: data.recordId },
    data: {
      blockId: data.blockId,
      appliedAt,
      scheduledAt: parseDate(data.scheduledAt),
      volume: parseFloatOrNull(data.volume),
      duration: parseIntOrNull(data.duration),
      method: data.method || null,
      status: data.status,
      notes: data.notes || null,
    },
  });

  revalidateIrrigationPaths(data.blockId);
  revalidatePath(`/irrigation/records/${data.recordId}`);
  revalidatePath(`/irrigation/records/${data.recordId}/edit`);
  return { success: true, recordId: data.recordId };
}
