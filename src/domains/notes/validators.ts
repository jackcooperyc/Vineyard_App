import { z } from "zod";

export const createBlockNoteSchema = z.object({
  blockId: z.string().min(1),
  content: z.string().min(1, "Note content is required").max(5000),
});
