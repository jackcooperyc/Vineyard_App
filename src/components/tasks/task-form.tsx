"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BlockMultiPicker } from "@/components/shared/block-multi-picker";
import { createTask, updateTask } from "@/domains/tasks/actions";
import { redirectAfterTaskCreate } from "@/domains/tasks/create-redirect";
import { EquipmentSelectField } from "@/components/equipment/equipment-select-field";
import type { TaskTypeConfig } from "@/domains/tasks/types";

type BlockOption = { id: string; code: string; name: string };
type UserOption = { id: string; name: string | null; email: string };
type EquipmentOption = { id: string; name: string; type: string };

type TaskValues = {
  id: string;
  blockId: string;
  blockIds?: string[];
  primaryBlockId?: string;
  taskTypeId: string;
  title: string;
  description: string | null;
  dueDate: Date | null;
  assignedToId: string | null;
  equipmentId: string | null;
};

function formatDateInput(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function TaskForm({
  blocks,
  users,
  equipment,
  taskTypes,
  defaultBlockId,
  task,
}: {
  blocks: BlockOption[];
  users: UserOption[];
  equipment: EquipmentOption[];
  taskTypes: TaskTypeConfig[];
  defaultBlockId?: string;
  task?: TaskValues;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(task);
  const initialBlockIds =
    task?.blockIds?.length ? task.blockIds : [task?.blockId ?? defaultBlockId ?? blocks[0]?.id].filter(Boolean) as string[];
  const initialPrimary =
    task?.primaryBlockId ?? task?.blockId ?? defaultBlockId ?? initialBlockIds[0] ?? null;

  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>(initialBlockIds);
  const [primaryBlockId, setPrimaryBlockId] = useState<string | null>(initialPrimary);
  const [beginTask, setBeginTask] = useState(false);

  const defaultTypeId =
    task?.taskTypeId ??
    taskTypes.find((t) => t.slug === "INSPECTION")?.id ??
    taskTypes[0]?.id;

  function handleBlockChange(ids: string[], primary: string) {
    setSelectedBlockIds(ids);
    setPrimaryBlockId(primary);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selectedBlockIds.length === 0) {
      setError("Select at least one block.");
      return;
    }
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("blockIds", JSON.stringify(selectedBlockIds));
    if (primaryBlockId) {
      formData.set("primaryBlockId", primaryBlockId);
    }
    if (beginTask) {
      formData.set("beginTask", "true");
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateTask(formData)
        : await createTask(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.taskId) {
        router.push(
          isEdit ? `/tasks/${result.taskId}` : redirectAfterTaskCreate(result),
        );
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {task && <input type="hidden" name="taskId" value={task.id} />}

      <div className="space-y-2">
        <Label>Blocks</Label>
        <BlockMultiPicker
          blocks={blocks}
          selectedIds={selectedBlockIds}
          primaryId={primaryBlockId}
          onChange={handleBlockChange}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="taskTypeId">Task type</Label>
        <select
          id="taskTypeId"
          name="taskTypeId"
          required
          defaultValue={defaultTypeId}
          className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
        >
          {taskTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
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
          defaultValue={task?.title}
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
          defaultValue={task?.description ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Due date</Label>
        <Input
          id="dueDate"
          name="dueDate"
          type="date"
          className="h-12 text-base"
          defaultValue={formatDateInput(task?.dueDate ?? null)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="equipmentId">Equipment (optional)</Label>
        <EquipmentSelectField
          equipment={equipment}
          defaultValue={task?.equipmentId ?? undefined}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="assignedToId">Assigned to</Label>
        <select
          id="assignedToId"
          name="assignedToId"
          defaultValue={task?.assignedToId ?? ""}
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

      {!isEdit && (
        <label className="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3">
          <input
            type="checkbox"
            checked={beginTask}
            onChange={(e) => setBeginTask(e.target.checked)}
            className="size-5 rounded border-input"
          />
          <div>
            <p className="font-medium">Begin task now</p>
            <p className="text-sm text-muted-foreground">
              Marks in progress and starts GPS tracking for eligible task types.
            </p>
          </div>
        </label>
      )}

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" className="min-h-11 flex-1 text-base" disabled={pending}>
          {pending
            ? isEdit
              ? "Saving…"
              : beginTask
                ? "Creating & starting…"
                : "Creating…"
            : isEdit
              ? "Save changes"
              : beginTask
                ? "Create & begin"
                : "Create task"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          render={<Link href={task ? `/tasks/${task.id}` : "/tasks"} />}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
