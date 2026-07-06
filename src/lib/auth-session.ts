import { auth } from "@/lib/auth";
import { assertCan, can, parseUserRole, type Permission } from "@/lib/rbac";
import type { UserRole } from "@/generated/prisma/client";

export type AuthSession = {
  user: {
    id: string;
    email?: string | null;
    name?: string | null;
    role: UserRole;
  };
};

export type AuthError = { error: string };

export async function requireAuth(): Promise<AuthSession | AuthError> {
  const session = await auth();
  if (!session?.user?.id) {
    return { error: "Unauthorized" };
  }

  const role = parseUserRole(session.user.role);
  if (!role) {
    return { error: "Unauthorized" };
  }

  return {
    user: {
      id: session.user.id,
      email: session.user.email,
      name: session.user.name,
      role,
    },
  };
}

export async function requirePermission(
  permission: Permission,
): Promise<AuthSession | AuthError> {
  const result = await requireAuth();
  if ("error" in result) {
    return result;
  }

  const check = assertCan(result.user.role, permission);
  if ("error" in check) {
    return { error: check.error };
  }

  return result;
}

export function hasPermission(
  role: UserRole | undefined | null,
  permission: Permission,
): boolean {
  return can(role, permission);
}
