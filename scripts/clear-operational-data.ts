/**
 * Hard-delete operational data for adopter onboarding clean slate.
 * Removes: Tasks (+ GPS, blocks, notification deliveries), MaintenanceRecord,
 * Equipment, IrrigationSchedule. Does NOT touch vineyard structure, users, pumps, etc.
 *
 * Usage: DATABASE_URL=... npx tsx scripts/clear-operational-data.ts
 * Dry run: DRY_RUN=1 npx tsx scripts/clear-operational-data.ts
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import "dotenv/config";

const DRY_RUN = process.env.DRY_RUN === "1" || process.env.DRY_RUN === "true";

async function countAll(db: PrismaClient) {
  return {
    taskGpsPoint: await db.taskGpsPoint.count(),
    taskGpsSession: await db.taskGpsSession.count(),
    taskBlock: await db.taskBlock.count(),
    notificationDelivery: await db.notificationDelivery.count(),
    task: await db.task.count(),
    maintenanceRecord: await db.maintenanceRecord.count(),
    equipment: await db.equipment.count(),
    irrigationSchedule: await db.irrigationSchedule.count(),
  };
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaPg({ connectionString });
  const db = new PrismaClient({ adapter });

  try {
    const before = await countAll(db);
    console.log("Counts before:", before);

    if (DRY_RUN) {
      console.log("DRY_RUN=1 — no rows deleted.");
      return;
    }

    const deleted = await db.$transaction(async (tx) => {
      const taskGpsPoint = await tx.taskGpsPoint.deleteMany({});
      const taskGpsSession = await tx.taskGpsSession.deleteMany({});
      const taskBlock = await tx.taskBlock.deleteMany({});
      const notificationDelivery = await tx.notificationDelivery.deleteMany({});
      const task = await tx.task.deleteMany({});
      const maintenanceRecord = await tx.maintenanceRecord.deleteMany({});
      const equipment = await tx.equipment.deleteMany({});
      const irrigationSchedule = await tx.irrigationSchedule.deleteMany({});

      return {
        taskGpsPoint: taskGpsPoint.count,
        taskGpsSession: taskGpsSession.count,
        taskBlock: taskBlock.count,
        notificationDelivery: notificationDelivery.count,
        task: task.count,
        maintenanceRecord: maintenanceRecord.count,
        equipment: equipment.count,
        irrigationSchedule: irrigationSchedule.count,
      };
    });

    console.log("Deleted:", deleted);

    const after = await countAll(db);
    console.log("Counts after:", after);

    const clearedTables = Object.entries(after).filter(([, n]) => n !== 0);
    if (clearedTables.length > 0) {
      throw new Error(
        `Clean slate verification failed — non-zero counts: ${JSON.stringify(Object.fromEntries(clearedTables))}`,
      );
    }

    const kept = {
      block: await db.block.count(),
      vineyard: await db.vineyard.count(),
      variety: await db.variety.count(),
      planting: await db.planting.count(),
      mapFeature: await db.mapFeature.count(),
      blockRow: await db.blockRow.count(),
      user: await db.user.count(),
      irrigationRecord: await db.irrigationRecord.count(),
      irrigationPump: await db.irrigationPump.count(),
      taskTypeDefinition: await db.taskTypeDefinition.count(),
      environmentalThreshold: await db.environmentalThreshold.count(),
      viticultureMetrics: await db.viticultureMetrics.count(),
      note: await db.note.count(),
    };
    console.log("Kept (sample counts):", kept);
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
