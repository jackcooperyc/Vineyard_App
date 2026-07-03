"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { updateNotificationPreferencesSchema } from "@/domains/notifications/validators";

function parseCheckbox(value: FormDataEntryValue | null): boolean {
  return value === "on" || value === "true" || value === "1";
}

export async function updateNotificationPreferences(formData: FormData) {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

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
    where: { userId: session.user.id },
    create: { userId: session.user.id, ...data },
    update: data,
  });

  revalidatePath("/settings/notifications");
  return { success: true };
}
