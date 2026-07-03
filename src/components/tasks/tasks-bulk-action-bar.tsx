"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { bulkUpdateTasks } from "@/domains/tasks/actions";
import { TASK_STATUS_LABELS, TASK_STATUSES } from "@/domains/tasks/constants";
import type { TaskTypeConfig } from "@/domains/tasks/types";
import type { TaskStatus } from "@/generated/prisma/client";

type UserOption = { id: string; name: string | null; email: string };

export function TasksBulkActionBar({
  selectedIds,
  taskTypes,
  users,
  onClear,
}: {
  selectedIds: string[];
  taskTypes: TaskTypeConfig[];
  users: UserOption[];
  onClear: () => void;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const activeTypes = taskTypes.filter((t) => t.active);

  function applyUpdate(
    updates: Omit<Parameters<typeof bulkUpdateTasks>[0], "taskIds">,
  ) {
    setError(null);
    startTransition(async () => {
      const result = await bulkUpdateTasks({
        taskIds: selectedIds,
        ...updates,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      onClear();
      router.refresh();
    });
  }

  if (selectedIds.length === 0) return null;

  return (
    <div className="sticky bottom-4 z-20 rounded-xl border bg-background/95 p-4 shadow-lg backdrop-blur">
      <div className="mb-3 flex items-center justify-between gap-2">
        <p className="text-sm font-medium">
          {selectedIds.length} task{selectedIds.length !== 1 ? "s" : ""} selected
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="size-8"
          onClick={onClear}
          aria-label="Clear selection"
        >
          <X className="size-4" />
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        <select
          disabled={pending}
          defaultValue=""
          onChange={(e) => {
            const status = e.target.value as TaskStatus;
            if (status) applyUpdate({ status });
            e.target.value = "";
          }}
          className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="">Change status…</option>
          {TASK_STATUSES.map((status) => (
            <option key={status} value={status}>
              {TASK_STATUS_LABELS[status]}
            </option>
          ))}
        </select>

        <select
          disabled={pending}
          defaultValue=""
          onChange={(e) => {
            const taskTypeId = e.target.value;
            if (taskTypeId) applyUpdate({ taskTypeId });
            e.target.value = "";
          }}
          className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm"
        >
          <option value="">Change type…</option>
          {activeTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>

        {users.length > 0 && (
          <select
            disabled={pending}
            defaultValue=""
            onChange={(e) => {
              const value = e.target.value;
              if (value === "__clear__") {
                applyUpdate({ assignedToId: null });
              } else if (value) {
                applyUpdate({ assignedToId: value });
              }
              e.target.value = "";
            }}
            className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm"
          >
            <option value="">Change assignee…</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name ?? user.email}
              </option>
            ))}
            <option value="__clear__">Unassigned</option>
          </select>
        )}

        <input
          type="date"
          disabled={pending}
          className="min-h-10 rounded-lg border border-input bg-background px-3 text-sm"
          onChange={(e) => {
            if (e.target.value) applyUpdate({ dueDate: e.target.value });
          }}
          aria-label="Set due date"
        />

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-10"
          disabled={pending}
          onClick={() => applyUpdate({ clearDueDate: true })}
        >
          Clear due date
        </Button>
      </div>

      {error && (
        <p className="mt-2 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
