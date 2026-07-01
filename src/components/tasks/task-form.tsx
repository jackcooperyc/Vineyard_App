"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createTask } from "@/domains/tasks/actions";
import { TASK_TYPES, TASK_TYPE_LABELS } from "@/domains/tasks/constants";
import type { TaskType } from "@/generated/prisma/client";

type BlockOption = { id: string; code: string; name: string };
type UserOption = { id: string; name: string | null; email: string };

export function TaskForm({
  blocks,
  users,
  defaultBlockId,
}: {
  blocks: BlockOption[];
  users: UserOption[];
  defaultBlockId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createTask(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.taskId) {
        router.push(`/tasks/${result.taskId}`);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="blockId">Block</Label>
        <select
          id="blockId"
          name="blockId"
          required
          defaultValue={defaultBlockId ?? blocks[0]?.id}
          className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
        >
          {blocks.map((block) => (
            <option key={block.id} value={block.id}>
              {block.code} — {block.name}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Task type</Label>
        <select
          id="type"
          name="type"
          required
          defaultValue="INSPECTION"
          className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
        >
          {TASK_TYPES.map((type) => (
            <option key={type} value={type}>
              {TASK_TYPE_LABELS[type as TaskType]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          name="title"
          required
          className="h-12 text-base"
          placeholder="e.g. Pre-harvest inspection"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          className="text-base"
          placeholder="Details, observations, or instructions…"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Due date</Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          className="h-12 text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignedToId">Assigned to</Label>
        <select
          id="assignedToId"
          name="assignedToId"
          className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
        >
          <option value="">Current user (default)</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name ?? user.email}
            </option>
          ))}
        </select>
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" className="min-h-11 flex-1 text-base" disabled={pending}>
          {pending ? "Creating…" : "Create task"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          render={<Link href="/tasks" />}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
