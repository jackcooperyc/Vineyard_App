import { z } from "zod";

export const updateNotificationPreferencesSchema = z.object({
  emailAssigned: z.coerce.boolean(),
  emailCreated: z.coerce.boolean(),
  emailCompleted: z.coerce.boolean(),
  emailInProgress: z.coerce.boolean(),
  emailCancelled: z.coerce.boolean(),
  emailPaused: z.coerce.boolean(),
  emailDueSoon: z.coerce.boolean(),
  emailOverdue: z.coerce.boolean(),
  dueSoonHours: z.coerce.number().int().min(1).max(168),
  quietHoursStart: z
    .union([z.literal(""), z.coerce.number().int().min(0).max(23)])
    .transform((v) => (v === "" ? null : v)),
  quietHoursEnd: z
    .union([z.literal(""), z.coerce.number().int().min(0).max(23)])
    .transform((v) => (v === "" ? null : v)),
  timezone: z.string().min(1).max(64),
});
