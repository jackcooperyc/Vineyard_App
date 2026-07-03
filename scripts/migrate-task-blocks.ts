/**
 * Backfill TaskBlock rows from existing Task.blockId.
 * Run after `prisma db push` when TaskBlock is new.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import "dotenv/config";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not set");
  }

  const adapter = new PrismaPg({ connectionString });
  const db = new PrismaClient({ adapter });

  try {
    const tasks = await db.task.findMany({
      where: { deletedAt: null },
      select: { id: true, blockId: true },
    });

    let created = 0;
    for (const task of tasks) {
      const existing = await db.taskBlock.findUnique({
        where: { taskId_blockId: { taskId: task.id, blockId: task.blockId } },
      });
      if (existing) continue;

      await db.taskBlock.create({
        data: {
          taskId: task.id,
          blockId: task.blockId,
          sortOrder: 0,
          isPrimary: true,
        },
      });
      created++;
    }

    const sessionsWithoutBlock = await db.taskGpsSession.findMany({
      where: { blockId: null },
      select: { id: true, task: { select: { blockId: true } } },
    });

    let sessionsUpdated = 0;
    for (const session of sessionsWithoutBlock) {
      await db.taskGpsSession.update({
        where: { id: session.id },
        data: { blockId: session.task.blockId },
      });
      sessionsUpdated++;
    }

    console.log(
      `migrate-task-blocks: ${created} TaskBlock rows created, ${sessionsUpdated} GPS sessions backfilled`,
    );
  } finally {
    await db.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
