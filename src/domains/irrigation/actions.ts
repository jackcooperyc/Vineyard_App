"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import {
  bulkDeleteIrrigationRecordsSchema,
  bulkToggleSchedulesActiveSchema,
  clearIrrigationAlertsSchema,
  createRecordSchema,
  createScheduleSchema,
  dismissIrrigationAlertSchema,
  quickLogRecordSchema,
  updateRecordSchema,
  updateScheduleSchema,
} from "@/domains/irrigation/validators";
import { notDeletedWhere } from "@/lib/soft-delete";
import { purgeExpiredSoftDeletes } from "@/lib/soft-delete-purge";
import {
  collectOverdueIrrigationSchedules,
} from "@/domains/irrigation/queries";
import { isIrrigationAlertDismissed } from "@/domains/irrigation/alert-dismissal";

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

async function resetAlertDismissalsForBlock(blockId: string) {
  await db.irrigationSchedule.updateMany({
    where: {
      blockId,
      ...notDeletedWhere(),
      alertDismissedAt: { not: null },
    },
    data: { alertDismissedAt: null },
  });
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

  if (data.status === "APPLIED") {
    await resetAlertDismissalsForBlock(data.blockId);
  }

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

  await resetAlertDismissalsForBlock(blockId);

  revalidateIrrigationPaths(blockId);
  return { success: true, recordId: record.id };
}

export async function toggleScheduleActive(scheduleId: string, active: boolean) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const existing = await db.irrigationSchedule.findFirst({
    where: { id: scheduleId, ...notDeletedWhere() },
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

export async function bulkToggleSchedulesActive(input: {
  scheduleIds: string[];
  active: boolean;
}) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = bulkToggleSchedulesActiveSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const schedules = await db.irrigationSchedule.findMany({
    where: { id: { in: parsed.data.scheduleIds }, ...notDeletedWhere() },
    select: { id: true, blockId: true },
  });

  if (schedules.length === 0) {
    return { error: "No schedules found" };
  }

  if (schedules.length !== parsed.data.scheduleIds.length) {
    return { error: "One or more schedules were not found" };
  }

  await db.irrigationSchedule.updateMany({
    where: { id: { in: parsed.data.scheduleIds } },
    data: { active: parsed.data.active },
  });

  const blockIds = [...new Set(schedules.map((s) => s.blockId))];
  revalidatePath("/irrigation");
  revalidatePath("/dashboard");
  revalidatePath("/field");
  revalidatePath("/map");
  for (const blockId of blockIds) {
    revalidatePath(`/blocks/${blockId}`);
  }

  return { success: true, updatedCount: schedules.length };
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

  const existing = await db.irrigationSchedule.findFirst({
    where: { id: scheduleId, ...notDeletedWhere() },
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

  const existing = await db.irrigationRecord.findFirst({
    where: { id: data.recordId, ...notDeletedWhere() },
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

  if (data.status === "APPLIED") {
    await resetAlertDismissalsForBlock(data.blockId);
  }

  revalidateIrrigationPaths(data.blockId);
  revalidatePath(`/irrigation/records/${data.recordId}`);
  revalidatePath(`/irrigation/records/${data.recordId}/edit`);
  return { success: true, recordId: data.recordId };
}

async function softDeleteIrrigationRecords(recordIds: string[]) {
  const records = await db.irrigationRecord.findMany({
    where: { id: { in: recordIds }, ...notDeletedWhere() },
    select: { id: true, blockId: true },
  });

  if (records.length === 0) {
    return { error: "No records found" as const };
  }

  if (records.length !== recordIds.length) {
    return {
      error: "One or more records were not found or already deleted" as const,
    };
  }

  await db.irrigationRecord.updateMany({
    where: { id: { in: recordIds }, ...notDeletedWhere() },
    data: { deletedAt: new Date() },
  });

  revalidateIrrigationPaths();
  for (const blockId of new Set(records.map((r) => r.blockId))) {
    revalidatePath(`/blocks/${blockId}`);
  }
  for (const record of records) {
    revalidatePath(`/irrigation/records/${record.id}`);
  }

  return { success: true as const, deletedCount: records.length };
}

export async function deleteIrrigationRecord(recordId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  await purgeExpiredSoftDeletes();

  const result = await softDeleteIrrigationRecords([recordId]);
  if ("error" in result) return { error: result.error };
  return { success: true };
}

export async function bulkDeleteIrrigationRecords(input: {
  recordIds: string[];
}) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = bulkDeleteIrrigationRecordsSchema.safeParse(input);
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  await purgeExpiredSoftDeletes();

  const result = await softDeleteIrrigationRecords(parsed.data.recordIds);
  if ("error" in result) return { error: result.error };
  return { success: true, deletedCount: result.deletedCount };
}

export async function restoreIrrigationRecord(recordId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  await purgeExpiredSoftDeletes();

  const record = await db.irrigationRecord.findFirst({
    where: { id: recordId, deletedAt: { not: null } },
    select: { blockId: true },
  });

  if (!record) return { error: "Deleted record not found" };

  await db.irrigationRecord.update({
    where: { id: recordId },
    data: { deletedAt: null },
  });

  revalidateIrrigationPaths(record.blockId);
  return { success: true };
}

export async function deleteIrrigationSchedule(scheduleId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  await purgeExpiredSoftDeletes();

  const schedule = await db.irrigationSchedule.findFirst({
    where: { id: scheduleId, ...notDeletedWhere() },
    select: { blockId: true },
  });

  if (!schedule) return { error: "Schedule not found" };

  await db.irrigationSchedule.update({
    where: { id: scheduleId },
    data: { deletedAt: new Date(), active: false },
  });

  revalidateSchedulePaths(scheduleId, schedule.blockId);
  return { success: true };
}

export async function restoreIrrigationSchedule(scheduleId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  await purgeExpiredSoftDeletes();

  const schedule = await db.irrigationSchedule.findFirst({
    where: { id: scheduleId, deletedAt: { not: null } },
    select: { blockId: true },
  });

  if (!schedule) return { error: "Deleted schedule not found" };

  await db.irrigationSchedule.update({
    where: { id: scheduleId },
    data: { deletedAt: null },
  });

  revalidateSchedulePaths(scheduleId, schedule.blockId);
  return { success: true };
}

export async function clearIrrigationAlerts(input?: { blockId?: string }) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = clearIrrigationAlertsSchema.safeParse(input ?? {});
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const overdue = await collectOverdueIrrigationSchedules(parsed.data.blockId);
  const scheduleIds = overdue
    .filter(
      (row) =>
        !isIrrigationAlertDismissed(row.alertDismissedAt, row.lastAppliedAt),
    )
    .map((row) => row.scheduleId);

  if (scheduleIds.length === 0) {
    return { success: true, clearedCount: 0 };
  }

  const now = new Date();
  await db.irrigationSchedule.updateMany({
    where: { id: { in: scheduleIds }, ...notDeletedWhere() },
    data: { alertDismissedAt: now },
  });

  revalidateIrrigationPaths(parsed.data.blockId);
  return { success: true, clearedCount: scheduleIds.length };
}

export async function dismissIrrigationAlert(scheduleId: string) {
  const session = await auth();
  if (!session?.user) return { error: "Unauthorized" };

  const parsed = dismissIrrigationAlertSchema.safeParse({ scheduleId });
  if (!parsed.success) return { error: "Invalid schedule" };

  const schedule = await db.irrigationSchedule.findFirst({
    where: { id: scheduleId, ...notDeletedWhere(), active: true },
    select: { id: true, blockId: true },
  });
  if (!schedule) return { error: "Schedule not found" };

  await db.irrigationSchedule.update({
    where: { id: scheduleId },
    data: { alertDismissedAt: new Date() },
  });

  revalidateSchedulePaths(scheduleId, schedule.blockId);
  return { success: true };
}
