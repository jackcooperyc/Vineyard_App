import type { TaskNotificationEventType } from "@/generated/prisma/client";
import { db } from "@/lib/db";
import { notDeletedWhere } from "@/lib/soft-delete";
import {
  EVENT_PREFERENCE_KEY,
  OPEN_TASK_STATUSES,
} from "@/domains/notifications/constants";
import { buildTaskNotificationEmail } from "@/domains/notifications/email-templates";
import { isEmailConfigured, sendEmail } from "@/domains/notifications/email";
import { isWithinQuietHours } from "@/domains/notifications/quiet-hours";
import { getOrCreateNotificationPreferences } from "@/domains/notifications/preferences-queries";
import type { TaskNotificationContext } from "@/domains/notifications/types";

function appBaseUrl(): string {
  return (
    process.env.AUTH_URL?.trim() ||
    process.env.NEXTAUTH_URL?.trim() ||
    "http://localhost:3000"
  );
}

async function loadTaskContext(taskId: string): Promise<TaskNotificationContext | null> {
  const task = await db.task.findFirst({
    where: { id: taskId, ...notDeletedWhere() },
    select: {
      id: true,
      title: true,
      status: true,
      dueDate: true,
      block: { select: { code: true, name: true } },
      taskType: { select: { label: true } },
      assignedTo: { select: { name: true } },
    },
  });

  if (!task) return null;

  return {
    taskId: task.id,
    title: task.title,
    status: task.status,
    dueDate: task.dueDate,
    blockCode: task.block.code,
    blockName: task.block.name,
    taskTypeLabel: task.taskType.label,
    assigneeName: task.assignedTo?.name ?? null,
  };
}

async function isEventEnabledForUser(
  userId: string,
  eventType: TaskNotificationEventType,
): Promise<{
  enabled: boolean;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  timezone: string;
}> {
  const pref = await getOrCreateNotificationPreferences(userId);
  const key = EVENT_PREFERENCE_KEY[eventType];
  return {
    enabled: Boolean(pref[key]),
    quietHoursStart: pref.quietHoursStart,
    quietHoursEnd: pref.quietHoursEnd,
    timezone: pref.timezone,
  };
}

export async function enqueueTaskNotification(input: {
  taskId: string;
  eventType: TaskNotificationEventType;
  recipientUserId: string;
  actorUserId?: string;
}): Promise<void> {
  const { taskId, eventType, recipientUserId, actorUserId } = input;

  if (actorUserId && actorUserId === recipientUserId) {
    return;
  }

  const task = await db.task.findFirst({
    where: { id: taskId, ...notDeletedWhere() },
    select: { id: true },
  });
  if (!task) return;

  const { enabled } = await isEventEnabledForUser(recipientUserId, eventType);
  if (!enabled) return;

  if (eventType === "OVERDUE") {
    const alreadySentToday = await hasOverdueNotificationToday(
      taskId,
      recipientUserId,
    );
    if (alreadySentToday) return;
  }

  await db.notificationDelivery.create({
    data: {
      taskId,
      eventType,
      recipientUserId,
      status: "PENDING",
    },
  });
}

async function hasOverdueNotificationToday(
  taskId: string,
  recipientUserId: string,
): Promise<boolean> {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const existing = await db.notificationDelivery.findFirst({
    where: {
      taskId,
      recipientUserId,
      eventType: "OVERDUE",
      status: { in: ["SENT", "PENDING"] },
      createdAt: { gte: startOfDay },
    },
    select: { id: true },
  });

  return Boolean(existing);
}

export async function processPendingDelivery(deliveryId: string): Promise<void> {
  const delivery = await db.notificationDelivery.findUnique({
    where: { id: deliveryId },
    include: {
      recipientUser: { select: { id: true, email: true, name: true } },
    },
  });

  if (!delivery || delivery.status !== "PENDING") return;

  if (delivery.taskId) {
    const task = await db.task.findFirst({
      where: { id: delivery.taskId, ...notDeletedWhere() },
      select: { id: true },
    });
    if (!task) {
      await db.notificationDelivery.update({
        where: { id: deliveryId },
        data: {
          status: "SKIPPED",
          error: "Task deleted or unavailable",
        },
      });
      return;
    }
  }

  const { enabled, quietHoursStart, quietHoursEnd, timezone } =
    await isEventEnabledForUser(
      delivery.recipientUserId,
      delivery.eventType,
    );

  if (!enabled) {
    await db.notificationDelivery.update({
      where: { id: deliveryId },
      data: { status: "SKIPPED", error: "Preference disabled" },
    });
    return;
  }

  if (isWithinQuietHours(quietHoursStart, quietHoursEnd, timezone)) {
    await db.notificationDelivery.update({
      where: { id: deliveryId },
      data: { status: "SKIPPED", error: "Quiet hours" },
    });
    return;
  }

  if (!isEmailConfigured()) {
    console.info("[notifications] Outbox pending — email not configured", {
      deliveryId,
      eventType: delivery.eventType,
    });
    return;
  }

  if (!delivery.taskId) {
    await db.notificationDelivery.update({
      where: { id: deliveryId },
      data: { status: "SKIPPED", error: "Missing task" },
    });
    return;
  }

  const context = await loadTaskContext(delivery.taskId);
  if (!context) {
    await db.notificationDelivery.update({
      where: { id: deliveryId },
      data: { status: "SKIPPED", error: "Task not found" },
    });
    return;
  }

  const taskUrl = `${appBaseUrl()}/tasks/${delivery.taskId}`;
  const email = buildTaskNotificationEmail({
    eventType: delivery.eventType,
    task: context,
    taskUrl,
    recipientName: delivery.recipientUser.name,
  });

  const result = await sendEmail({
    to: delivery.recipientUser.email,
    subject: email.subject,
    html: email.html,
    text: email.text,
  });

  if (result.ok) {
    await db.notificationDelivery.update({
      where: { id: deliveryId },
      data: { status: "SENT", sentAt: new Date(), error: null },
    });
    return;
  }

  await db.notificationDelivery.update({
    where: { id: deliveryId },
    data: {
      status: result.provider === "noop" ? "PENDING" : "FAILED",
      error: result.error,
    },
  });
}

export async function flushPendingDeliveries(limit = 50): Promise<number> {
  const pending = await db.notificationDelivery.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    take: limit,
    select: { id: true },
  });

  for (const row of pending) {
    await processPendingDelivery(row.id);
  }

  return pending.length;
}

export async function emitTaskEvent(input: {
  taskId: string;
  eventType: TaskNotificationEventType;
  recipientUserIds: string[];
  actorUserId?: string;
}): Promise<void> {
  const uniqueRecipients = [...new Set(input.recipientUserIds.filter(Boolean))];

  for (const recipientUserId of uniqueRecipients) {
    await enqueueTaskNotification({
      taskId: input.taskId,
      eventType: input.eventType,
      recipientUserId,
      actorUserId: input.actorUserId,
    });
  }

  await flushPendingDeliveries();
}

export function statusTransitionEvent(
  previousStatus: string,
  nextStatus: string,
): TaskNotificationEventType | null {
  if (previousStatus === nextStatus) return null;

  if (nextStatus === "COMPLETED") return "COMPLETED";
  if (nextStatus === "CANCELLED") return "CANCELLED";
  if (nextStatus === "IN_PROGRESS") return "IN_PROGRESS";
  if (previousStatus === "IN_PROGRESS" && nextStatus === "PENDING") {
    return "PAUSED";
  }

  return null;
}

export { OPEN_TASK_STATUSES };
