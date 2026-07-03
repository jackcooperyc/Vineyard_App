import { db } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

export async function validateBlockIds(
  blockIds: string[],
  tx?: Prisma.TransactionClient,
): Promise<{ error?: string }> {
  const client = tx ?? db;
  const unique = [...new Set(blockIds)];
  if (unique.length === 0) {
    return { error: "At least one block is required" };
  }
  const count = await client.block.count({
    where: { id: { in: unique }, blockType: "VINEYARD" },
  });
  if (count !== unique.length) {
    return { error: "One or more selected blocks are invalid" };
  }
  return {};
}

export function resolvePrimaryBlockId(
  blockIds: string[],
  primaryBlockId?: string,
): string {
  if (primaryBlockId && blockIds.includes(primaryBlockId)) {
    return primaryBlockId;
  }
  return blockIds[0]!;
}

export async function syncTaskBlocks(
  taskId: string,
  blockIds: string[],
  primaryBlockId?: string,
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? db;
  const primary = resolvePrimaryBlockId(blockIds, primaryBlockId);

  await client.taskBlock.deleteMany({ where: { taskId } });

  await client.taskBlock.createMany({
    data: blockIds.map((blockId, index) => ({
      taskId,
      blockId,
      sortOrder: index,
      isPrimary: blockId === primary,
    })),
  });

  await client.task.update({
    where: { id: taskId },
    data: { blockId: primary },
  });
}

export async function rollupTaskCoverage(
  taskId: string,
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? db;
  const blocks = await client.taskBlock.findMany({
    where: { taskId },
    select: { coveragePct: true, rowsCompleted: true, rowsTotal: true },
  });

  if (blocks.length === 0) return;

  const withCoverage = blocks.filter((b) => b.coveragePct != null);
  const coveragePct =
    withCoverage.length > 0
      ? withCoverage.reduce((sum, b) => sum + (b.coveragePct ?? 0), 0) /
        withCoverage.length
      : null;

  const withRows = blocks.filter((b) => b.rowsTotal != null && b.rowsTotal > 0);
  const rowsCompleted =
    withRows.length > 0
      ? withRows.reduce((sum, b) => sum + (b.rowsCompleted ?? 0), 0)
      : null;
  const rowsTotal =
    withRows.length > 0
      ? withRows.reduce((sum, b) => sum + (b.rowsTotal ?? 0), 0)
      : null;

  await client.task.update({
    where: { id: taskId },
    data: {
      coveragePct,
      rowsCompleted,
      rowsTotal,
    },
  });
}

export async function updateTaskBlockProgress(
  taskId: string,
  blockId: string,
  data: {
    coveragePct?: number | null;
    rowsCompleted?: number | null;
    rowsTotal?: number | null;
  },
  tx?: Prisma.TransactionClient,
) {
  const client = tx ?? db;
  await client.taskBlock.update({
    where: { taskId_blockId: { taskId, blockId } },
    data,
  });
  await rollupTaskCoverage(taskId, client);
}
