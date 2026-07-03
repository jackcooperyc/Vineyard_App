import type {
  NotificationDeliveryStatus,
  TaskNotificationEventType,
} from "@/generated/prisma/client";

export type NotificationPreferenceFields = {
  emailAssigned: boolean;
  emailCreated: boolean;
  emailCompleted: boolean;
  emailInProgress: boolean;
  emailCancelled: boolean;
  emailPaused: boolean;
  emailDueSoon: boolean;
  emailOverdue: boolean;
  dueSoonHours: number;
  quietHoursStart: number | null;
  quietHoursEnd: number | null;
  timezone: string;
};

export type TaskNotificationContext = {
  taskId: string;
  title: string;
  status: string;
  dueDate: Date | null;
  blockCode: string;
  blockName: string;
  taskTypeLabel: string;
  assigneeName: string | null;
};

export type EmitTaskEventInput = {
  taskId: string;
  eventType: TaskNotificationEventType;
  recipientUserIds: string[];
  actorUserId?: string;
};

export type DeliveryRecord = {
  id: string;
  status: NotificationDeliveryStatus;
};
