"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import { BlockPicker, type BlockPickerItem } from "@/components/shared/block-picker";
import { TaskTypeChips } from "@/components/shared/task-type-chips";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { quickLogTask } from "@/domains/tasks/actions";
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
  const [blockId, setBlockId] = useState<string | null>(defaultBlockId ?? null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const selectedBlock = blocks.find((b) => b.id === blockId) ?? null;

  function logTask(taskTypeId: string) {
    if (!blockId) {
      setError("Select a block first.");
      return;
    }
    setError(null);
    const formData = new FormData();
    formData.set("blockId", blockId);
    formData.set("taskTypeId", taskTypeId);

    startTransition(async () => {
      const result = await quickLogTask(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && defaultBlockId) {
          setBlockId(defaultBlockId);
        }
        if (!next) setError(null);
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
              : "Select a block, then tap a task type to save."}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-6 px-4 pb-6">
          <BlockPicker blocks={blocks} value={blockId} onChange={setBlockId} />
          <div className="space-y-3">
            <p className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Tap task type to log
            </p>
            <TaskTypeChips
              types={quickLogTypes}
              onSelect={logTask}
              disabled={pending || !blockId}
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
