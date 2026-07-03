/** Retention window before soft-deleted records are permanently removed. */
export const SOFT_DELETE_RETENTION_MS = 48 * 60 * 60 * 1000;

export function notDeletedWhere() {
  return { deletedAt: null } as const;
}

export function deletedWithinRetentionWhere() {
  const cutoff = new Date(Date.now() - SOFT_DELETE_RETENTION_MS);
  return { deletedAt: { not: null, gte: cutoff } } as const;
}

export function expiredDeletedWhere() {
  const cutoff = new Date(Date.now() - SOFT_DELETE_RETENTION_MS);
  return { deletedAt: { lt: cutoff } } as const;
}

export function getPermanentDeletionAt(deletedAt: Date): Date {
  return new Date(deletedAt.getTime() + SOFT_DELETE_RETENTION_MS);
}

export function formatDeletionCountdown(deletedAt: Date): string {
  const remaining = getPermanentDeletionAt(deletedAt).getTime() - Date.now();
  if (remaining <= 0) return "Expiring soon";

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));

  if (hours >= 24) {
    const days = Math.floor(hours / 24);
    const remHours = hours % 24;
    return `${days}d ${remHours}h remaining`;
  }
  if (hours > 0) return `${hours}h ${minutes}m remaining`;
  return `${minutes}m remaining`;
}
