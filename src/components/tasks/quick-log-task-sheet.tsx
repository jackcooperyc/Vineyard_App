"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
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
import { defaultTitleForTypeConfig } from "@/domains/tasks/constants";
import type { TaskTypeConfig } from "@/domains/tasks/types";

export function QuickLogTaskSheet({
  blockId,
  blockCode,
  blockName,
  equipment = [],
  quickLogTypes,
}: {
  blockId: string;
  blockCode: string;
  blockName: string;
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

  const selectedType = quickLogTypes.find((t) => t.id === taskTypeId);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
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
    <Sheet open={open} onOpenChange={setOpen}>
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
          <SheetDescription>
            {blockCode} · {blockName}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-6">
          <div className="space-y-2">
            <Label>Task type</Label>
            <TaskTypeChips
              types={quickLogTypes}
              value={taskTypeId}
              onChange={setTaskTypeId}
            />
            <input type="hidden" name="taskTypeId" value={taskTypeId} />
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
                          blockCode,
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
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" size="touch" className="w-full" disabled={pending}>
            {pending ? "Saving…" : "Save task"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
