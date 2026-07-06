"use server";

import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { requirePermission } from "@/lib/auth-session";
import { db } from "@/lib/db";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/domains/notifications/constants";
import { countOwners } from "@/domains/users/queries";
import {
  createUserSchema,
  updateUserRoleSchema,
} from "@/domains/users/validators";

function generateTemporaryPassword(): string {
  return randomBytes(9).toString("base64url").slice(0, 12);
}

export async function createUser(formData: FormData) {
  const session = await requirePermission("users:manage");
  if ("error" in session) return { error: session.error };

  const parsed = createUserSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    role: formData.get("role") || "FIELD_WORKER",
    password: formData.get("password") || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { name, email, role } = parsed.data;
  const temporaryPassword = parsed.data.password ?? generateTemporaryPassword();

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    return { error: "A user with this email already exists" };
  }

  const passwordHash = await bcrypt.hash(temporaryPassword, 12);

  const user = await db.user.create({
    data: {
      name,
      email,
      role,
      passwordHash,
      notificationPreference: {
        create: { ...DEFAULT_NOTIFICATION_PREFERENCES },
      },
    },
  });

  revalidatePath("/settings/users");
  return {
    success: true,
    userId: user.id,
    temporaryPassword,
  };
}

export async function updateUserRole(formData: FormData) {
  const session = await requirePermission("users:manage");
  if ("error" in session) return { error: session.error };

  const parsed = updateUserRoleSchema.safeParse({
    userId: formData.get("userId"),
    role: formData.get("role"),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const { userId, role } = parsed.data;

  if (userId === session.user.id && role !== "OWNER") {
    return { error: "You cannot change your own role" };
  }

  const target = await db.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (!target) {
    return { error: "User not found" };
  }

  if (target.role === "OWNER" && role !== "OWNER") {
    const owners = await countOwners();
    if (owners <= 1) {
      return { error: "Cannot demote the last owner account" };
    }
  }

  await db.user.update({
    where: { id: userId },
    data: { role },
  });

  revalidatePath("/settings/users");
  return { success: true };
}
