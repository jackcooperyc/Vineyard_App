"use server";

import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-session";
import { db } from "@/lib/db";
import { createBlockNoteSchema } from "@/domains/notes/validators";

export async function createBlockNote(formData: FormData) {
  const session = await requirePermission("notes:create");
  if ("error" in session) return { error: session.error };

  const parsed = createBlockNoteSchema.safeParse({
    blockId: formData.get("blockId"),
    content: formData.get("content"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { blockId, content } = parsed.data;

  const block = await db.block.findUnique({
    where: { id: blockId },
    select: { id: true },
  });

  if (!block) {
    return { error: "Block not found" };
  }

  const note = await db.note.create({
    data: {
      blockId,
      content: content.trim(),
      authorId: session.user.id,
    },
  });

  revalidatePath(`/blocks/${blockId}`);
  return { success: true, noteId: note.id };
}
