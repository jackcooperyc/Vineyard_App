"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { BlockMultiPicker } from "@/components/shared/block-multi-picker";
import type { BlockPickerItem } from "@/components/shared/block-picker";
import { TaskTypeChips } from "@/components/shared/task-type-chips";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { quickLogTask } from "@/domains/tasks/actions";
import { redirectAfterTaskCreate } from "@/domains/tasks/create-redirect";
import type { TaskTypeConfig } from "@/domains/tasks/types";

export function TasksQuickLogSheet({
  blocks,
  quickLogTypes,
  defaultBlockId,
  fab = false,
}: {
  blocks: BlockPickerItem[];
  quickLogTypes: TaskTypeConfig[];
  defaultBlockId?: string;
  fab?: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>(
    defaultBlockId ? [defaultBlockId] : [],
  );
  const [primaryBlockId, setPrimaryBlockId] = useState<string | null>(
    defaultBlockId ?? null,
  );
  const [beginTask, setBeginTask] = useState(false);
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const selectedBlock = blocks.find((b) => b.id === primaryBlockId) ?? null;
  const selectedType = quickLogTypes.find((t) => t.id === selectedTypeId);

  function logTask(taskTypeId: string, withBegin: boolean) {
    if (selectedBlockIds.length === 0 || !primaryBlockId) {
      setError("Select at least one block.");
      return;
    }
    setError(null);
    const formData = new FormData();
    formData.set("blockIds", JSON.stringify(selectedBlockIds));
    formData.set("primaryBlockId", primaryBlockId);
    formData.set("taskTypeId", taskTypeId);
    if (withBegin) formData.set("beginTask", "true");

    startTransition(async () => {
      const result = await quickLogTask(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      if (result.taskId) {
        router.push(redirectAfterTaskCreate({ ...result, began: withBegin }));
      }
      router.refresh();
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && defaultBlockId) {
          setSelectedBlockIds([defaultBlockId]);
          setPrimaryBlockId(defaultBlockId);
        }
        if (!next) {
          setError(null);
          setBeginTask(false);
          setSelectedTypeId(null);
        }
      }}
    >
      <SheetTrigger
        render={
          fab ? (
            <Button
              size="icon"
              className="size-14 rounded-full shadow-lg"
              aria-label="Quick log task"
            >
              <Plus className="size-6" />
            </Button>
          ) : (
            <Button variant="outline" className="min-h-11 gap-2">
              <Plus className="size-4" />
              <span className="hidden sm:inline">Quick log</span>
              <span className="sm:hidden">Log</span>
            </Button>
          )
        }
      />
      <SheetContent
        side="bottom"
        className="max-h-[90dvh] overflow-y-auto rounded-t-xl"
      >
        <SheetHeader>
          <SheetTitle>Quick log task</SheetTitle>
          <SheetDescription>
            {selectedBlock
              ? `${selectedBlock.code} · ${selectedBlock.name}`
              : "Select blocks, then tap a task type to save."}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 px-4 pb-6">
          <BlockMultiPicker
            blocks={blocks}
            selectedIds={selectedBlockIds}
            primaryId={primaryBlockId}
            onChange={(ids, primary) => {
              setSelectedBlockIds(ids);
              setPrimaryBlockId(primary);
            }}
          />

          {selectedType?.tracksGpsProgress && (
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3">
              <input
                type="checkbox"
                checked={beginTask}
                onChange={(e) => setBeginTask(e.target.checked)}
                className="size-5 rounded border-input"
              />
              <div>
                <p className="font-medium">Begin task & start GPS</p>
                <p className="text-sm text-muted-foreground">
                  Redirects to field view after logging.
                </p>
              </div>
            </label>
          )}

          <div className="space-y-3">
            <Label className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Tap task type to log
            </Label>
            <TaskTypeChips
              types={quickLogTypes}
              onSelect={(typeId) => {
                setSelectedTypeId(typeId);
                logTask(typeId, beginTask);
              }}
              disabled={pending || selectedBlockIds.length === 0}
            />
          </div>
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
