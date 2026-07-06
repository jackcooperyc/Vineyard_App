"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateUserRole } from "@/domains/users/actions";
import type { UserRole } from "@/generated/prisma/client";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "OWNER", label: "Owner" },
  { value: "MANAGER", label: "Manager" },
  { value: "FIELD_WORKER", label: "Field worker" },
  { value: "READ_ONLY", label: "Read only" },
];

export function UserRoleSelect({
  userId,
  currentRole,
  disabled,
}: {
  userId: string;
  currentRole: UserRole;
  disabled?: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleChange(role: UserRole) {
    const formData = new FormData();
    formData.set("userId", userId);
    formData.set("role", role);

    startTransition(async () => {
      const result = await updateUserRole(formData);
      if (!result.error) {
        router.refresh();
      }
    });
  }

  return (
    <select
      value={currentRole}
      disabled={disabled || pending}
      onChange={(e) => handleChange(e.target.value as UserRole)}
      className="flex h-9 rounded-lg border border-input bg-background px-2 text-sm"
      aria-label="User role"
    >
      {ROLE_OPTIONS.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}
