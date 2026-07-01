"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Droplets, ListTodo } from "lucide-react";
import { BlockPicker, type BlockPickerItem } from "@/components/shared/block-picker";
import { TaskTypeChips } from "@/components/shared/task-type-chips";
import { Button } from "@/components/ui/button";
import { quickLogIrrigation } from "@/domains/irrigation/actions";
import { quickLogTask } from "@/domains/tasks/actions";
import type { TaskType } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

type FieldMode = "task" | "irrigation";

export function FieldLogPanel({ blocks }: { blocks: BlockPickerItem[] }) {
  const router = useRouter();
  const [mode, setMode] = useState<FieldMode>("task");
  const [blockId, setBlockId] = useState<string | null>(null);
  const [taskType, setTaskType] = useState<TaskType>("INSPECTION");
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedBlock = blocks.find((b) => b.id === blockId) ?? null;

  function logTask(type: TaskType) {
    if (!blockId) {
      setError("Select a block first.");
      return;
    }
    setError(null);
    setMessage(null);
    const formData = new FormData();
    formData.set("blockId", blockId);
    formData.set("type", type);

    startTransition(async () => {
      const result = await quickLogTask(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(`Task logged for ${selectedBlock?.name ?? "block"}.`);
      router.refresh();
    });
  }

  function logIrrigationToday() {
    if (!blockId) {
      setError("Select a block first.");
      return;
    }
    setError(null);
    setMessage(null);
    const formData = new FormData();
    formData.set("blockId", blockId);
    formData.set("method", "Drip");
    formData.set("appliedAt", new Date().toISOString().split("T")[0]);

    startTransition(async () => {
      const result = await quickLogIrrigation(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage(`Irrigation logged for ${selectedBlock?.name ?? "block"}.`);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-2">
        {(
          [
            { id: "task" as const, label: "Log task", icon: ListTodo },
            { id: "irrigation" as const, label: "Irrigation", icon: Droplets },
          ] as const
        ).map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setMode(tab.id);
                setError(null);
                setMessage(null);
              }}
              className={cn(
                "field-tap flex items-center justify-center gap-2 rounded-xl border px-3 py-3 text-sm font-semibold touch-manipulation",
                mode === tab.id
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card",
              )}
            >
              <Icon className="size-5" />
              {tab.label}
            </button>
          );
        })}
      </div>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          1 · Select block
        </h3>
        <BlockPicker blocks={blocks} value={blockId} onChange={setBlockId} />
      </section>

      {mode === "task" ? (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            2 · Tap task type to log
          </h3>
          <TaskTypeChips
            value={taskType}
            onChange={setTaskType}
            onSelect={logTask}
            disabled={pending || !blockId}
          />
          <p className="text-sm text-muted-foreground">
            Tap a task type to save immediately with an auto-generated title.
          </p>
        </section>
      ) : (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            2 · Mark irrigated today
          </h3>
          <Button
            type="button"
            size="touch"
            className="w-full"
            disabled={pending || !blockId}
            onClick={logIrrigationToday}
          >
            <Droplets className="size-5" />
            {pending ? "Saving…" : "Irrigation applied today"}
          </Button>
          <p className="text-sm text-muted-foreground">
            Records drip irrigation for today. Add volume and duration from the
            block detail page if needed.
          </p>
        </section>
      )}

      {message && (
        <p
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100"
          role="status"
        >
          <CheckCircle2 className="size-5 shrink-0" />
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
