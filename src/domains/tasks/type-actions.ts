"use server";

import { revalidatePath, revalidateTag } from "next/cache";
import { requirePermission } from "@/lib/auth-session";
import { db } from "@/lib/db";
import {
  createTaskTypeSchema,
  reorderTaskTypesSchema,
  updateTaskTypeSchema,
} from "@/domains/tasks/type-validators";

function revalidateTaskTypePaths() {
  revalidateTag("task-types", "max");
  revalidatePath("/tasks");
  revalidatePath("/tasks/settings");
  revalidatePath("/field");
  revalidatePath("/dashboard");
}

export async function createTaskType(formData: FormData) {
  const authResult = await requirePermission("tasks:types");
  if ("error" in authResult) return { error: authResult.error };

  const parsed = createTaskTypeSchema.safeParse({
    label: formData.get("label"),
    slug: formData.get("slug"),
    iconName: formData.get("iconName"),
    colorHex: formData.get("colorHex") || undefined,
    showInQuickLog:
      formData.get("showInQuickLog") === "true" ||
      formData.get("showInQuickLog") === "on",
    defaultTitleTemplate: formData.get("defaultTitleTemplate") || undefined,
    defaultDueDaysOffset: formData.get("defaultDueDaysOffset") || undefined,
    tracksGpsProgress: formData.get("tracksGpsProgress") === "true",
    defaultSwathWidthM: formData.get("defaultSwathWidthM") || undefined,
    active:
      formData.get("active") === "true" || formData.get("active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;
  const maxOrder = await db.taskTypeDefinition.aggregate({ _max: { sortOrder: true } });
  const sortOrder = (maxOrder._max.sortOrder ?? -1) + 1;

  const existing = await db.taskTypeDefinition.findUnique({
    where: { slug: data.slug },
  });
  if (existing) return { error: "Slug already exists" };

  const row = await db.taskTypeDefinition.create({
    data: {
      slug: data.slug,
      label: data.label,
      iconName: data.iconName,
      colorHex: data.colorHex || null,
      showInQuickLog: data.showInQuickLog ?? true,
      defaultTitleTemplate: data.defaultTitleTemplate || null,
      defaultDueDaysOffset: data.defaultDueDaysOffset ?? null,
      tracksGpsProgress: data.tracksGpsProgress ?? false,
      defaultSwathWidthM: data.defaultSwathWidthM ?? null,
      active: data.active ?? true,
      sortOrder,
    },
  });

  revalidateTaskTypePaths();
  return { success: true, taskTypeId: row.id };
}

export async function updateTaskType(formData: FormData) {
  const authResult = await requirePermission("tasks:types");
  if ("error" in authResult) return { error: authResult.error };

  const parsed = updateTaskTypeSchema.safeParse({
    taskTypeId: formData.get("taskTypeId"),
    label: formData.get("label"),
    slug: formData.get("slug"),
    iconName: formData.get("iconName"),
    colorHex: formData.get("colorHex") || undefined,
    showInQuickLog:
      formData.get("showInQuickLog") === "true" ||
      formData.get("showInQuickLog") === "on",
    defaultTitleTemplate: formData.get("defaultTitleTemplate") || undefined,
    defaultDueDaysOffset: formData.get("defaultDueDaysOffset") || undefined,
    tracksGpsProgress: formData.get("tracksGpsProgress") === "true",
    defaultSwathWidthM: formData.get("defaultSwathWidthM") || undefined,
    active:
      formData.get("active") === "true" || formData.get("active") === "on",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { taskTypeId, ...data } = parsed.data;

  const existing = await db.taskTypeDefinition.findUnique({
    where: { id: taskTypeId },
  });
  if (!existing) return { error: "Task type not found" };

  const slugConflict = await db.taskTypeDefinition.findFirst({
    where: { slug: data.slug, id: { not: taskTypeId } },
  });
  if (slugConflict) return { error: "Slug already in use" };

  await db.taskTypeDefinition.update({
    where: { id: taskTypeId },
    data: {
      slug: data.slug,
      label: data.label,
      iconName: data.iconName,
      colorHex: data.colorHex || null,
      showInQuickLog: data.showInQuickLog ?? true,
      defaultTitleTemplate: data.defaultTitleTemplate || null,
      defaultDueDaysOffset: data.defaultDueDaysOffset ?? null,
      tracksGpsProgress: data.tracksGpsProgress ?? false,
      defaultSwathWidthM: data.defaultSwathWidthM ?? null,
      active: data.active ?? true,
    },
  });

  revalidateTaskTypePaths();
  return { success: true, taskTypeId };
}

export async function reorderTaskTypes(orderedIds: string[]) {
  const authResult = await requirePermission("tasks:types");
  if ("error" in authResult) return { error: authResult.error };

  const parsed = reorderTaskTypesSchema.safeParse({ orderedIds });
  if (!parsed.success) return { error: "Invalid order" };

  await db.$transaction(
    parsed.data.orderedIds.map((id, index) =>
      db.taskTypeDefinition.update({
        where: { id },
        data: { sortOrder: index },
      }),
    ),
  );

  revalidateTaskTypePaths();
  return { success: true };
}

export async function deactivateTaskType(taskTypeId: string) {
  const authResult = await requirePermission("tasks:types");
  if ("error" in authResult) return { error: authResult.error };

  await db.taskTypeDefinition.update({
    where: { id: taskTypeId },
    data: { active: false },
  });

  revalidateTaskTypePaths();
  return { success: true };
}
