"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { bulkUpdateTasks } from "@/domains/tasks/actions";
import { TASK_STATUS_LABELS, TASK_STATUSES } from "@/domains/tasks/constants";
import type { TaskTypeConfig } from "@/domains/tasks/types";
import type { TaskStatus } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type UserOption = { id: string; name: string | null; email: string };

function BulkActionFields({
  pending,
  activeTypes,
  users,
  onApply,
}: {
  pending: boolean;
  activeTypes: TaskTypeConfig[];
  users: UserOption[];
  onApply: (
    updates: Omit<Parameters<typeof bulkUpdateTasks>[0], "taskIds">,
  ) => void;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
      <select
        disabled={pending}
        defaultValue=""
        onChange={(e) => {
          const status = e.target.value as TaskStatus;
          if (status) onApply({ status });
          e.target.value = "";
        }}
        className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm sm:min-h-10 sm:w-auto"
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
          if (taskTypeId) onApply({ taskTypeId });
          e.target.value = "";
        }}
        className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm sm:min-h-10 sm:w-auto"
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
              onApply({ assignedToId: null });
            } else if (value) {
              onApply({ assignedToId: value });
            }
            e.target.value = "";
          }}
          className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm sm:min-h-10 sm:w-auto"
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
        className="min-h-11 w-full rounded-lg border border-input bg-background px-3 text-sm sm:min-h-10 sm:w-auto"
        onChange={(e) => {
          if (e.target.value) onApply({ dueDate: e.target.value });
        }}
        aria-label="Set due date"
      />

      <Button
        type="button"
        variant="outline"
        className="min-h-11 w-full sm:min-h-10 sm:w-auto"
        disabled={pending}
        onClick={() => onApply({ clearDueDate: true })}
      >
        Clear due date
      </Button>
    </div>
  );
}

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
  const [sheetOpen, setSheetOpen] = useState(false);
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
      setSheetOpen(false);
      onClear();
      router.refresh();
    });
  }

  if (selectedIds.length === 0) return null;

  const countLabel = `${selectedIds.length} task${selectedIds.length !== 1 ? "s" : ""} selected`;

  return (
    <>
      <div
        className={cn(
          "z-40 rounded-xl border bg-background/95 p-3 shadow-lg backdrop-blur",
          "fixed inset-x-4 bottom-[5.75rem] md:sticky md:inset-x-auto md:bottom-4 md:p-4",
        )}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">{countLabel}</p>
          <div className="flex items-center gap-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="min-h-10 gap-1.5 md:hidden"
              onClick={() => setSheetOpen(true)}
            >
              <SlidersHorizontal className="size-4" />
              Actions
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="size-10 shrink-0 touch-manipulation"
              onClick={onClear}
              aria-label="Clear selection"
            >
              <X className="size-4" />
            </Button>
          </div>
        </div>

        <div className="mt-3 hidden md:block">
          <BulkActionFields
            pending={pending}
            activeTypes={activeTypes}
            users={users}
            onApply={applyUpdate}
          />
        </div>

        {error && (
          <p className="mt-2 text-sm text-destructive md:mt-2" role="alert">
            {error}
          </p>
        )}
      </div>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" className="max-h-[85dvh]">
          <SheetHeader>
            <SheetTitle>Bulk actions</SheetTitle>
            <SheetDescription>{countLabel}</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            <BulkActionFields
              pending={pending}
              activeTypes={activeTypes}
              users={users}
              onApply={applyUpdate}
            />
            {error && (
              <p className="mt-3 text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
