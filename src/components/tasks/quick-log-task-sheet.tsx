"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import {
  BlockMultiPicker,
  formatTaskBlockLabel,
} from "@/components/shared/block-multi-picker";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { EquipmentSelectField } from "@/components/equipment/equipment-select-field";
import { TaskTypeChips } from "@/components/shared/task-type-chips";
import { quickLogTask } from "@/domains/tasks/actions";
import { redirectAfterTaskCreate } from "@/domains/tasks/create-redirect";
import { showTaskLoggedToast } from "@/lib/submission-toast";
import { defaultTitleForTypeConfig } from "@/domains/tasks/constants";
import type { TaskTypeConfig } from "@/domains/tasks/types";

type BlockOption = { id: string; code: string; name: string };

function resetSheetState(
  blockId: string,
  setters: {
    setSelectedBlockIds: (ids: string[]) => void;
    setPrimaryBlockId: (id: string) => void;
    setShowDetails: (v: boolean) => void;
    setBeginTask: (v: boolean) => void;
    setError: (v: string | null) => void;
  },
) {
  setters.setSelectedBlockIds([blockId]);
  setters.setPrimaryBlockId(blockId);
  setters.setShowDetails(false);
  setters.setBeginTask(false);
  setters.setError(null);
}

export function QuickLogTaskSheet({
  blockId,
  blockCode,
  blockName,
  blocks = [],
  equipment = [],
  quickLogTypes,
}: {
  blockId: string;
  blockCode: string;
  blockName: string;
  blocks?: BlockOption[];
  equipment?: { id: string; name: string; type: string }[];
  quickLogTypes: TaskTypeConfig[];
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const defaultTypeId =
    quickLogTypes.find((t) => t.slug === "INSPECTION")?.id ??
    quickLogTypes[0]?.id ??
    "";
  const [taskTypeId, setTaskTypeId] = useState(defaultTypeId);
  const [showDetails, setShowDetails] = useState(false);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([blockId]);
  const [primaryBlockId, setPrimaryBlockId] = useState<string>(blockId);
  const [beginTask, setBeginTask] = useState(false);

  const selectedType = quickLogTypes.find((t) => t.id === taskTypeId);
  const allBlocks =
    blocks.length > 0
      ? blocks
      : [{ id: blockId, code: blockCode, name: blockName }];

  const primaryBlock =
    allBlocks.find((b) => b.id === primaryBlockId) ??
    allBlocks.find((b) => b.id === blockId);
  const primaryCode = primaryBlock?.code ?? blockCode;

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      resetSheetState(blockId, {
        setSelectedBlockIds,
        setPrimaryBlockId,
        setShowDetails,
        setBeginTask,
        setError,
      });
    }
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
    formData.set("primaryBlockId", primaryBlockId);
    formData.set("taskTypeId", taskTypeId);
    if (beginTask) formData.set("beginTask", "true");

    startTransition(async () => {
      const result = await quickLogTask(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      const detail = [
        selectedType?.label,
        (formData.get("title") as string | null)?.trim() || undefined,
        blockSummary,
      ]
        .filter(Boolean)
        .join(" · ");
      showTaskLoggedToast(detail || undefined, { began: beginTask });
      if (result.taskId) {
        router.push(redirectAfterTaskCreate(result));
      }
      router.refresh();
    });
  }

  const selectedBlocksForLabel = allBlocks.filter((b) =>
    selectedBlockIds.includes(b.id),
  );
  const blockSummary =
    selectedBlocksForLabel.length > 0
      ? formatTaskBlockLabel(selectedBlocksForLabel, primaryBlock)
      : `${blockCode} · ${blockName}`;

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetTrigger
        render={
          <Button size="touch" className="gap-2">
            <Plus className="size-4" />
            Log task
          </Button>
        }
      />
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Quick log task</SheetTitle>
          <SheetDescription>{blockSummary}</SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-6">
          {allBlocks.length > 1 && (
            <div className="space-y-2">
              <Label>Blocks</Label>
              <BlockMultiPicker
                blocks={allBlocks}
                selectedIds={selectedBlockIds}
                primaryId={primaryBlockId}
                onChange={(ids, primary) => {
                  setSelectedBlockIds(ids);
                  setPrimaryBlockId(primary);
                }}
              />
            </div>
          )}

          <div className="space-y-2">
            <Label>Task type</Label>
            <TaskTypeChips
              types={quickLogTypes}
              value={taskTypeId}
              onChange={(id) => {
                setTaskTypeId(id);
                const type = quickLogTypes.find((t) => t.id === id);
                if (!type?.tracksGpsProgress) setBeginTask(false);
              }}
            />
          </div>

          <Button
            type="button"
            variant="ghost"
            className="h-auto p-0 text-sm text-muted-foreground"
            onClick={() => setShowDetails((v) => !v)}
          >
            {showDetails ? "Hide details" : "Add title, notes, or equipment"}
          </Button>
          {showDetails && (
            <>
              <div className="space-y-2">
                <Label htmlFor="quick-title">Title (optional)</Label>
                <Input
                  id="quick-title"
                  name="title"
                  className="h-12 text-base"
                  placeholder={
                    selectedType
                      ? defaultTitleForTypeConfig(
                          selectedType.label,
                          primaryCode,
                          selectedType.defaultTitleTemplate,
                        )
                      : undefined
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quick-description">Notes (optional)</Label>
                <Textarea
                  id="quick-description"
                  name="description"
                  rows={3}
                  placeholder="Field observations…"
                  className="text-base"
                />
              </div>
              {equipment.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="quick-equipment">Equipment (optional)</Label>
                  <EquipmentSelectField
                    equipment={equipment}
                    id="quick-equipment"
                  />
                </div>
              )}
            </>
          )}

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
                  Opens field view with GPS tracking on the primary block (
                  {primaryCode}).
                </p>
              </div>
            </label>
          )}

          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" size="touch" className="w-full" disabled={pending}>
            {pending
              ? "Saving…"
              : beginTask
                ? "Log & begin"
                : "Save task"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
