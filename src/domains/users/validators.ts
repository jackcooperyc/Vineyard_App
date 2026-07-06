import { z } from "zod";

export const userRoleSchema = z.enum([
  "OWNER",
  "MANAGER",
  "FIELD_WORKER",
  "READ_ONLY",
]);

export const createUserSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  email: z.string().email("Valid email is required"),
  role: userRoleSchema.default("FIELD_WORKER"),
  password: z.string().min(8, "Password must be at least 8 characters").optional(),
});

export const updateUserRoleSchema = z.object({
  userId: z.string().min(1),
  role: userRoleSchema,
});
