import { db } from "@/lib/db";
import type { UserRole } from "@/generated/prisma/client";

export type UserListItem = {
  id: string;
  name: string | null;
  email: string;
  role: UserRole;
  createdAt: Date;
};

export async function getUsers(): Promise<UserListItem[]> {
  return db.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
    orderBy: [{ role: "asc" }, { name: "asc" }],
  });
}

export async function getUserById(id: string) {
  return db.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true,
    },
  });
}

export async function countOwners(): Promise<number> {
  return db.user.count({ where: { role: "OWNER" } });
}
