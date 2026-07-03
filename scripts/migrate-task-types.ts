/**
 * Migrates legacy Task.type enum column to Task.taskTypeId FK.
 * Safe to run before `prisma db push` on databases that still have the old schema.
 */
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import "dotenv/config";
import { DEFAULT_TASK_TYPES, seedTaskTypes } from "../prisma/seed-task-types";

async function columnExists(
  prisma: PrismaClient,
  table: string,
  column: string,
): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = ${table}
        AND column_name = ${column}
    ) AS exists
  `;
  return rows[0]?.exists ?? false;
}

async function tableExists(prisma: PrismaClient, table: string): Promise<boolean> {
  const rows = await prisma.$queryRaw<{ exists: boolean }[]>`
    SELECT EXISTS (
      SELECT 1 FROM information_schema.tables
      WHERE table_schema = 'public'
        AND table_name = ${table}
    ) AS exists
  `;
  return rows[0]?.exists ?? false;
}

async function ensureTaskTypeDefinitionTable(prisma: PrismaClient) {
  const exists = await tableExists(prisma, "TaskTypeDefinition");
  if (exists) return;

  await prisma.$executeRawUnsafe(`
    CREATE TABLE "TaskTypeDefinition" (
      "id" TEXT NOT NULL,
      "slug" TEXT NOT NULL,
      "label" TEXT NOT NULL,
      "iconName" TEXT NOT NULL DEFAULT 'ListTodo',
      "colorHex" TEXT,
      "sortOrder" INTEGER NOT NULL DEFAULT 0,
      "active" BOOLEAN NOT NULL DEFAULT true,
      "showInQuickLog" BOOLEAN NOT NULL DEFAULT true,
      "defaultTitleTemplate" TEXT,
      "defaultDueDaysOffset" INTEGER,
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT "TaskTypeDefinition_pkey" PRIMARY KEY ("id")
    )
  `);
  await prisma.$executeRawUnsafe(
    `CREATE UNIQUE INDEX "TaskTypeDefinition_slug_key" ON "TaskTypeDefinition"("slug")`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX "TaskTypeDefinition_active_idx" ON "TaskTypeDefinition"("active")`,
  );
  await prisma.$executeRawUnsafe(
    `CREATE INDEX "TaskTypeDefinition_sortOrder_idx" ON "TaskTypeDefinition"("sortOrder")`,
  );
  console.log("Created TaskTypeDefinition table");
}

async function main() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    console.error("DATABASE_URL is required");
    process.exit(1);
  }

  const adapter = new PrismaPg({ connectionString });
  const prisma = new PrismaClient({ adapter });

  try {
    await ensureTaskTypeDefinitionTable(prisma);

    const hasLegacyType = await columnExists(prisma, "Task", "type");
    const hasTaskTypeId = await columnExists(prisma, "Task", "taskTypeId");

    const typeIdBySlug = await seedTaskTypes(prisma);
    console.log(`Task types seeded: ${typeIdBySlug.size} definitions`);

    if (!hasLegacyType && hasTaskTypeId) {
      console.log("Migration already applied — nothing to backfill.");
      return;
    }

    if (!hasTaskTypeId) {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE "Task" ADD COLUMN IF NOT EXISTS "taskTypeId" TEXT`,
      );
      console.log("Added Task.taskTypeId column");
    }

    if (hasLegacyType) {
      for (const def of DEFAULT_TASK_TYPES) {
        const typeId = typeIdBySlug.get(def.slug);
        if (!typeId) continue;
        await prisma.$executeRaw`
          UPDATE "Task"
          SET "taskTypeId" = ${typeId}
          WHERE "type"::text = ${def.slug}
            AND ("taskTypeId" IS NULL OR "taskTypeId" = '')
        `;
      }
    }

    const otherId = typeIdBySlug.get("OTHER");
    if (otherId) {
      await prisma.$executeRaw`
        UPDATE "Task"
        SET "taskTypeId" = ${otherId}
        WHERE "taskTypeId" IS NULL OR "taskTypeId" = ''
      `;
    }

    console.log("Backfilled Task.taskTypeId");
    console.log("Run prisma db push to add FK and drop legacy type column.");
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
