"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createUser } from "@/domains/users/actions";
import type { UserRole } from "@/generated/prisma/client";

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "MANAGER", label: "Manager" },
  { value: "FIELD_WORKER", label: "Field worker" },
  { value: "READ_ONLY", label: "Read only" },
];

export function UserForm({ onCreated }: { onCreated?: () => void }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [temporaryPassword, setTemporaryPassword] = useState<string | null>(null);
  const [createdEmail, setCreatedEmail] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createUser(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.temporaryPassword) {
        setTemporaryPassword(result.temporaryPassword);
        setCreatedEmail(formData.get("email") as string);
        e.currentTarget.reset();
        onCreated?.();
        router.refresh();
      }
    });
  }

  if (temporaryPassword && createdEmail) {
    return (
      <div className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900/50 dark:bg-emerald-950/40">
        <div>
          <p className="font-semibold text-emerald-900 dark:text-emerald-100">
            User created
          </p>
          <p className="mt-1 text-sm text-emerald-800 dark:text-emerald-200">
            Share this temporary password with {createdEmail}. It is shown only once.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-background px-3 py-2 text-sm font-mono">
            {temporaryPassword}
          </code>
          <Button
            type="button"
            variant="outline"
            className="shrink-0"
            onClick={() => void navigator.clipboard.writeText(temporaryPassword)}
          >
            Copy
          </Button>
        </div>
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={() => {
            setTemporaryPassword(null);
            setCreatedEmail(null);
          }}
        >
          Add another user
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="user-name">Name</Label>
        <Input id="user-name" name="name" required className="h-12 text-base" />
      </div>
      <div className="space-y-2">
        <Label htmlFor="user-email">Email</Label>
        <Input
          id="user-email"
          name="email"
          type="email"
          required
          className="h-12 text-base"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="user-role">Role</Label>
        <select
          id="user-role"
          name="role"
          defaultValue="FIELD_WORKER"
          className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
        >
          {ROLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="user-password">Temporary password (optional)</Label>
        <Input
          id="user-password"
          name="password"
          type="text"
          minLength={8}
          className="h-12 text-base"
          placeholder="Auto-generated if left blank"
        />
        <p className="text-xs text-muted-foreground">
          Minimum 8 characters. Leave blank to generate a secure password automatically.
        </p>
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="min-h-11 w-full" disabled={pending}>
        {pending ? "Creating…" : "Create user"}
      </Button>
    </form>
  );
}
