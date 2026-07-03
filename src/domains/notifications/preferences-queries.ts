import { db } from "@/lib/db";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/domains/notifications/constants";
import type { NotificationPreferenceFields } from "@/domains/notifications/types";

export async function getNotificationPreferencesForUser(userId: string) {
  const pref = await db.userNotificationPreference.findUnique({
    where: { userId },
  });

  if (!pref) {
    return { userId, ...DEFAULT_NOTIFICATION_PREFERENCES };
  }

  return {
    userId: pref.userId,
    emailAssigned: pref.emailAssigned,
    emailCreated: pref.emailCreated,
    emailCompleted: pref.emailCompleted,
    emailInProgress: pref.emailInProgress,
    emailCancelled: pref.emailCancelled,
    emailPaused: pref.emailPaused,
    emailDueSoon: pref.emailDueSoon,
    emailOverdue: pref.emailOverdue,
    dueSoonHours: pref.dueSoonHours,
    quietHoursStart: pref.quietHoursStart,
    quietHoursEnd: pref.quietHoursEnd,
    timezone: pref.timezone,
  } satisfies NotificationPreferenceFields & { userId: string };
}

export async function getOrCreateNotificationPreferences(userId: string) {
  const existing = await db.userNotificationPreference.findUnique({
    where: { userId },
  });

  if (existing) return existing;

  return db.userNotificationPreference.create({
    data: { userId, ...DEFAULT_NOTIFICATION_PREFERENCES },
  });
}
