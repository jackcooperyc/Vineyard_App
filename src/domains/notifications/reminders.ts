import { db } from "@/lib/db";
import { notDeletedWhere } from "@/lib/soft-delete";
import {
  emitTaskEvent,
  flushPendingDeliveries,
} from "@/domains/notifications/delivery";

export async function runTaskReminderNotifications(): Promise<{
  dueSoon: number;
  overdue: number;
  flushed: number;
}> {
  const now = new Date();
  let dueSoonCount = 0;
  let overdueCount = 0;

  const preferences = await db.userNotificationPreference.findMany({
    where: {
      OR: [{ emailDueSoon: true }, { emailOverdue: true }],
    },
    select: {
      userId: true,
      emailDueSoon: true,
      emailOverdue: true,
      dueSoonHours: true,
    },
  });

  if (preferences.length === 0) {
    const flushed = await flushPendingDeliveries(200);
    return { dueSoon: 0, overdue: 0, flushed };
  }

  const openTasks = await db.task.findMany({
    where: {
      ...notDeletedWhere(),
      status: { in: ["PENDING", "IN_PROGRESS"] },
      dueDate: { not: null },
      OR: [{ assignedToId: { not: null } }, { createdById: { not: null } }],
    },
    select: {
      id: true,
      dueDate: true,
      assignedToId: true,
      createdById: true,
    },
  });

  for (const pref of preferences) {
    const dueSoonCutoff = new Date(
      now.getTime() + pref.dueSoonHours * 60 * 60 * 1000,
    );

    for (const task of openTasks) {
      if (!task.dueDate) continue;

      const recipientIds = [
        task.assignedToId,
        task.createdById,
      ].filter((id): id is string => Boolean(id));

      const uniqueRecipients = [...new Set(recipientIds)].filter(
        (id) => id === pref.userId,
      );

      if (uniqueRecipients.length === 0) continue;

      if (
        pref.emailDueSoon &&
        task.dueDate > now &&
        task.dueDate <= dueSoonCutoff
      ) {
        const alreadyNotified = await wasReminderSentRecently(
          task.id,
          pref.userId,
          "DUE_SOON",
        );
        if (!alreadyNotified) {
          await emitTaskEvent({
            taskId: task.id,
            eventType: "DUE_SOON",
            recipientUserIds: [pref.userId],
          });
          dueSoonCount += 1;
        }
      }

      if (pref.emailOverdue && task.dueDate < now) {
        await emitTaskEvent({
          taskId: task.id,
          eventType: "OVERDUE",
          recipientUserIds: [pref.userId],
        });
        overdueCount += 1;
      }
    }
  }

  const flushed = await flushPendingDeliveries(200);

  return { dueSoon: dueSoonCount, overdue: overdueCount, flushed };
}

async function wasReminderSentRecently(
  taskId: string,
  recipientUserId: string,
  eventType: "DUE_SOON",
): Promise<boolean> {
  const since = new Date(Date.now() - 12 * 60 * 60 * 1000);

  const existing = await db.notificationDelivery.findFirst({
    where: {
      taskId,
      recipientUserId,
      eventType,
      status: { in: ["SENT", "PENDING"] },
      createdAt: { gte: since },
    },
    select: { id: true },
  });

  return Boolean(existing);
}
