import type { TaskNotificationEventType } from "@/generated/prisma/client";
import type { NotificationPreferenceFields } from "@/domains/notifications/types";

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferenceFields = {
  emailAssigned: true,
  emailCreated: false,
  emailCompleted: true,
  emailInProgress: true,
  emailCancelled: true,
  emailPaused: true,
  emailDueSoon: true,
  emailOverdue: true,
  dueSoonHours: 24,
  quietHoursStart: null,
  quietHoursEnd: null,
  timezone: "America/Los_Angeles",
};

export const EVENT_PREFERENCE_KEY: Record<
  TaskNotificationEventType,
  keyof NotificationPreferenceFields
> = {
  ASSIGNED: "emailAssigned",
  CREATED: "emailCreated",
  COMPLETED: "emailCompleted",
  IN_PROGRESS: "emailInProgress",
  CANCELLED: "emailCancelled",
  PAUSED: "emailPaused",
  DUE_SOON: "emailDueSoon",
  OVERDUE: "emailOverdue",
};

export const EVENT_LABELS: Record<TaskNotificationEventType, string> = {
  ASSIGNED: "Task assigned to you",
  CREATED: "Task you created",
  COMPLETED: "Task completed",
  IN_PROGRESS: "Task started",
  CANCELLED: "Task cancelled",
  PAUSED: "Task paused",
  DUE_SOON: "Task due soon",
  OVERDUE: "Task overdue",
};

export const EVENT_DESCRIPTIONS: Record<TaskNotificationEventType, string> = {
  ASSIGNED: "When a task is assigned to you",
  CREATED: "When you create a new task",
  COMPLETED: "When an assigned task is marked complete",
  IN_PROGRESS: "When an assigned task is started",
  CANCELLED: "When an assigned task is cancelled",
  PAUSED: "When an assigned task moves back to pending",
  DUE_SOON: "Reminder before a task due date",
  OVERDUE: "Reminder when a task is past due",
};

export const OPEN_TASK_STATUSES = ["PENDING", "IN_PROGRESS"] as const;
