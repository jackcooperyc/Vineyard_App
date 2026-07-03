import type { TaskNotificationEventType } from "@/generated/prisma/client";
import { EVENT_LABELS } from "@/domains/notifications/constants";
import type { TaskNotificationContext } from "@/domains/notifications/types";

function formatDueDate(dueDate: Date | null): string {
  if (!dueDate) return "No due date";
  return dueDate.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function eventHeadline(eventType: TaskNotificationEventType): string {
  switch (eventType) {
    case "ASSIGNED":
      return "You've been assigned a task";
    case "CREATED":
      return "Task created";
    case "COMPLETED":
      return "Task completed";
    case "IN_PROGRESS":
      return "Task in progress";
    case "CANCELLED":
      return "Task cancelled";
    case "PAUSED":
      return "Task paused";
    case "DUE_SOON":
      return "Task due soon";
    case "OVERDUE":
      return "Task overdue";
    default:
      return EVENT_LABELS[eventType];
  }
}

export function buildTaskNotificationEmail(input: {
  eventType: TaskNotificationEventType;
  task: TaskNotificationContext;
  taskUrl: string;
  recipientName: string | null;
}): { subject: string; html: string; text: string } {
  const { eventType, task, taskUrl, recipientName } = input;
  const greeting = recipientName ? `Hi ${recipientName},` : "Hi,";
  const headline = eventHeadline(eventType);
  const dueLine = formatDueDate(task.dueDate);
  const assigneeLine = task.assigneeName
    ? `Assignee: ${task.assigneeName}`
    : "Unassigned";

  const text = [
    greeting,
    "",
    headline,
    "",
    task.title,
    `Block: ${task.blockCode} — ${task.blockName}`,
    `Type: ${task.taskTypeLabel}`,
    `Status: ${task.status.replace("_", " ")}`,
    `Due: ${dueLine}`,
    assigneeLine,
    "",
    `View task: ${taskUrl}`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${headline}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#18181b;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f4f4f5;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid #e4e4e7;">
          <tr>
            <td style="padding:24px 24px 8px;">
              <p style="margin:0 0 8px;font-size:13px;color:#71717a;">Cooper Estate Vineyard</p>
              <h1 style="margin:0;font-size:22px;line-height:1.3;font-weight:600;">${headline}</h1>
            </td>
          </tr>
          <tr>
            <td style="padding:8px 24px 16px;">
              <p style="margin:0 0 16px;font-size:15px;line-height:1.5;color:#3f3f46;">${greeting}</p>
              <div style="background:#fafafa;border:1px solid #e4e4e7;border-radius:8px;padding:16px;">
                <p style="margin:0 0 8px;font-size:17px;font-weight:600;">${escapeHtml(task.title)}</p>
                <p style="margin:0 0 4px;font-size:14px;color:#52525b;">Block: ${escapeHtml(task.blockCode)} — ${escapeHtml(task.blockName)}</p>
                <p style="margin:0 0 4px;font-size:14px;color:#52525b;">Type: ${escapeHtml(task.taskTypeLabel)}</p>
                <p style="margin:0 0 4px;font-size:14px;color:#52525b;">Status: ${escapeHtml(task.status.replace("_", " "))}</p>
                <p style="margin:0 0 4px;font-size:14px;color:#52525b;">Due: ${escapeHtml(dueLine)}</p>
                <p style="margin:0;font-size:14px;color:#52525b;">${escapeHtml(assigneeLine)}</p>
              </div>
            </td>
          </tr>
          <tr>
            <td style="padding:0 24px 24px;">
              <a href="${taskUrl}" style="display:inline-block;background:#166534;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:12px 20px;border-radius:8px;">View task</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    subject: `${headline}: ${task.title}`,
    html,
    text,
  };
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}
