"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-session";
import { db } from "@/lib/db";
import { updateNotificationPreferencesSchema } from "@/domains/notifications/validators";

function parseCheckbox(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true" || value === "1";
}

export async function updateNotificationPreferences(formData: FormData) {
  const authResult = await requirePermission("notifications:self");
  if ("error" in authResult) return { error: authResult.error };
  const userId = authResult.user.id;

  const parsed = updateNotificationPreferencesSchema.safeParse({
    emailAssigned: parseCheckbox(formData.get("emailAssigned")),
    emailCreated: parseCheckbox(formData.get("emailCreated")),
    emailCompleted: parseCheckbox(formData.get("emailCompleted")),
    emailInProgress: parseCheckbox(formData.get("emailInProgress")),
    emailCancelled: parseCheckbox(formData.get("emailCancelled")),
    emailPaused: parseCheckbox(formData.get("emailPaused")),
    emailDueSoon: parseCheckbox(formData.get("emailDueSoon")),
    emailOverdue: parseCheckbox(formData.get("emailOverdue")),
    dueSoonHours: formData.get("dueSoonHours"),
    quietHoursStart: formData.get("quietHoursStart") ?? "",
    quietHoursEnd: formData.get("quietHoursEnd") ?? "",
    timezone: formData.get("timezone") ?? "America/Los_Angeles",
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const data = parsed.data;

  await db.userNotificationPreference.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });

  revalidatePath("/settings/notifications");
  return { success: true };
}
