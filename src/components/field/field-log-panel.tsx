"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, Droplets, ListTodo, Wrench } from "lucide-react";
import { FieldTaskSection } from "@/components/field/field-task-section";
import { MaintenanceRecordForm } from "@/components/equipment/maintenance-record-form";
import { BlockPicker, type BlockPickerItem } from "@/components/shared/block-picker";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { quickLogIrrigation } from "@/domains/irrigation/actions";
import { quickLogTask } from "@/domains/tasks/actions";
import type { TaskTypeConfig } from "@/domains/tasks/types";
import { cn } from "@/lib/utils";

type FieldMode = "task" | "irrigation" | "maintenance";

type EquipmentOption = { id: string; name: string; type: string };

export function FieldLogPanel({
  blocks,
  equipment = [],
  quickLogTypes,
}: {
  blocks: BlockPickerItem[];
  equipment?: EquipmentOption[];
  quickLogTypes: TaskTypeConfig[];
}) {
  const router = useRouter();
  const [mode, setMode] = useState<FieldMode>("task");
  const [blockId, setBlockId] = useState<string | null>(null);
  const [taskTypeId, setTaskTypeId] = useState<string>(
    quickLogTypes.find((t) => t.slug === "INSPECTION")?.id ??
      quickLogTypes[0]?.id ??
      "",
  );
  const [equipmentId, setEquipmentId] = useState<string>(
    equipment[0]?.id ?? "",
  );
  const [maintenanceOpen, setMaintenanceOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const selectedBlock = blocks.find((b) => b.id === blockId) ?? null;

  function logTask(typeId: string) {
    if (!blockId) {
      setError("Select a block first.");
      return;
    }
    setError(null);
    setMessage(null);
    const formData = new FormData();
    formData.set("blockId", blockId);
    formData.set("taskTypeId", typeId);

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

  const tabs = [
    { id: "task" as const, label: "Task", icon: ListTodo },
    { id: "irrigation" as const, label: "Irrigation", icon: Droplets },
    { id: "maintenance" as const, label: "Service", icon: Wrench },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-2">
        {tabs.map((tab) => {
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
                "field-tap flex items-center justify-center gap-2 rounded-xl border px-2 py-3 text-sm font-semibold touch-manipulation",
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

      {mode === "task" ? (
        <FieldTaskSection
          blocks={blocks}
          quickLogTypes={quickLogTypes}
          blockId={blockId}
          onBlockIdChange={setBlockId}
          taskTypeId={taskTypeId}
          onTaskTypeIdChange={setTaskTypeId}
          onQuickLog={logTask}
          quickLogPending={pending}
        />
      ) : mode === "irrigation" ? (
        <>
          <section className="space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              1 · Select block
            </h3>
            <BlockPicker blocks={blocks} value={blockId} onChange={setBlockId} />
          </section>
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
        </>
      ) : (
        <section className="space-y-3">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Log equipment service
          </h3>
          {equipment.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active equipment on file.
            </p>
          ) : (
            <>
              <select
                value={equipmentId}
                onChange={(e) => setEquipmentId(e.target.value)}
                className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
              >
                {equipment.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name} ({item.type})
                  </option>
                ))}
              </select>
              <Button
                type="button"
                size="touch"
                className="w-full"
                onClick={() => setMaintenanceOpen(true)}
                disabled={!equipmentId}
              >
                <Wrench className="size-5" />
                Open service form
              </Button>
            </>
          )}
          <p className="text-sm text-muted-foreground">
            Record maintenance work and set the next service due date.
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
        <p
          className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {error}
        </p>
      )}

      <Sheet open={maintenanceOpen} onOpenChange={setMaintenanceOpen}>
        <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Log maintenance</SheetTitle>
            <SheetDescription>
              Record service work for the selected equipment.
            </SheetDescription>
          </SheetHeader>
          {equipmentId && (
            <div className="mt-6">
              <MaintenanceRecordForm
                key={equipmentId}
                equipmentId={equipmentId}
                onSuccess={() => {
                  setMaintenanceOpen(false);
                  setMessage("Maintenance logged.");
                }}
              />
            </div>
          )}
        </SheetContent>
      </Sheet>
    </div>
  );
}
