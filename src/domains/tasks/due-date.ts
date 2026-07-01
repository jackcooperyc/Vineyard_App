export type DueUrgency = "overdue" | "today" | "soon" | "normal" | "none";

export function getDueUrgency(dueDate: Date | null): DueUrgency {
  if (!dueDate) return "none";

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(dueDate);
  due.setHours(0, 0, 0, 0);
  const diff = Math.round(
    (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diff < 0) return "overdue";
  if (diff === 0) return "today";
  if (diff <= 3) return "soon";
  return "normal";
}

export function formatDueLabel(dueDate: Date | null): string | null {
  if (!dueDate) return null;

  const urgency = getDueUrgency(dueDate);
  const formatted = dueDate.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });

  switch (urgency) {
    case "overdue":
      return `Overdue · ${formatted}`;
    case "today":
      return "Due today";
    case "soon":
      return `Due ${formatted}`;
    default:
      return `Due ${formatted}`;
  }
}

export const dueUrgencyStyles: Record<
  DueUrgency,
  { text: string; badge?: string }
> = {
  overdue: {
    text: "text-red-700 dark:text-red-400",
    badge: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950/50 dark:text-red-300 dark:border-red-900/50",
  },
  today: {
    text: "text-amber-700 dark:text-amber-400",
    badge: "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-900/50",
  },
  soon: {
    text: "text-orange-700 dark:text-orange-400",
  },
  normal: {
    text: "text-muted-foreground",
  },
  none: {
    text: "text-muted-foreground",
  },
};
