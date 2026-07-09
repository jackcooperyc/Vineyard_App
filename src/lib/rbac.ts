import type { UserRole } from "@/generated/prisma/client";

/**
 * Permission inventory — map each domain action export to a permission key.
 *
 * tasks/actions.ts: createTask, quickLogTask, updateTask, updateTaskStatus,
 *   beginTask, markTaskComplete, startTask, deleteTask, restoreTask, bulkUpdateTasks
 * tasks/type-actions.ts: createTaskType, updateTaskType, reorderTaskTypes, deactivateTaskType
 * irrigation/actions.ts: createIrrigationSchedule, createIrrigationRecord, quickLogIrrigation,
 *   toggleScheduleActive, bulkToggleSchedulesActive, updateSchedule, updateIrrigationRecord,
 *   deleteIrrigationRecord, bulkDeleteIrrigationRecords, restoreIrrigationRecord,
 *   deleteIrrigationSchedule, restoreIrrigationSchedule, clearIrrigationAlerts, dismissIrrigationAlert
 * equipment/actions.ts: createEquipment, updateEquipment, updateEquipmentStatus,
 *   retireEquipment, deleteEquipment, restoreEquipment, createMaintenanceRecord,
 *   updateMaintenanceRecord, deleteMaintenanceRecord, restoreMaintenanceRecord
 * pumps/actions.ts: createIrrigationPump, updateIrrigationPump
 * tours/actions.ts: createTourPOI, updateTourPOI, relocateTourPOI, deleteTourPOI
 * block-rows/actions.ts: importBlockRows, updateBlockSpacing
 * varieties/actions.ts: updateVarietyColor, updateVineyardMapColorMode
 * task-gps/actions.ts: startGpsSession, switchGpsSessionBlock, pauseGpsSession,
 *   resumeGpsSession, endGpsSession, appendTaskGpsPoints, cancelGpsSession
 * notifications/preferences-actions.ts: updateNotificationPreferences (self only)
 * users/actions.ts: createUser, updateUserRole
 * blocks/actions.ts: updateBlock, createPlanting, updatePlanting, deletePlanting
 * map/actions.ts: createMapSpace, updateMapSpace, deleteMapSpace
 * notes/actions.ts: createBlockNote
 */

export const PERMISSIONS = [
  "users:manage",
  "blocks:edit",
  "notes:create",
  "tasks:create",
  "tasks:update",
  "tasks:delete",
  "tasks:types",
  "irrigation:log",
  "irrigation:manage",
  "equipment:manage",
  "pumps:manage",
  "tours:manage",
  "import:data",
  "varieties:manage",
  "gps:manage",
  "notifications:self",
] as const;

export type Permission = (typeof PERMISSIONS)[number];

const ROLE_PERMISSIONS: Record<UserRole, readonly Permission[]> = {
  OWNER: PERMISSIONS,
  MANAGER: PERMISSIONS.filter((p) => p !== "users:manage"),
  FIELD_WORKER: [
    "tasks:create",
    "tasks:update",
    "irrigation:log",
    "notes:create",
    "gps:manage",
    "notifications:self",
  ],
  READ_ONLY: [],
};

export function can(role: UserRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function assertCan(
  role: UserRole | undefined | null,
  permission: Permission,
): { ok: true } | { error: string } {
  if (!role) {
    return { error: "Unauthorized" };
  }
  if (!can(role, permission)) {
    return { error: "Forbidden" };
  }
  return { ok: true };
}

export function isUserRole(value: string | undefined | null): value is UserRole {
  return (
    value === "OWNER" ||
    value === "MANAGER" ||
    value === "FIELD_WORKER" ||
    value === "READ_ONLY"
  );
}

export function parseUserRole(value: string | undefined | null): UserRole | null {
  return isUserRole(value) ? value : null;
}
