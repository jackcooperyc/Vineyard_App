import { db } from "@/lib/db";
import { expiredDeletedWhere } from "@/lib/soft-delete";

/** Permanently removes soft-deleted records older than the retention window. */
export async function purgeExpiredSoftDeletes() {
  const where = expiredDeletedWhere();

  await Promise.all([
    db.task.deleteMany({ where }),
    db.irrigationRecord.deleteMany({ where }),
    db.irrigationSchedule.deleteMany({ where }),
    db.maintenanceRecord.deleteMany({ where }),
    db.equipment.deleteMany({ where }),
  ]);
}
