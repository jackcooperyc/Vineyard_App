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
import { quickLogTask } from "@/domains/tasks/actions";
import {
  QUICK_LOG_TYPES,
  TASK_TYPE_LABELS,
  defaultTitleForType,
} from "@/domains/tasks/constants";
import type { TaskType } from "@/generated/prisma/client";

export function QuickLogTaskSheet({
  blockId,
  blockCode,
  blockName,
}: {
  blockId: string;
  blockCode: string;
  blockName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [type, setType] = useState<TaskType>("INSPECTION");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("blockId", blockId);
    formData.set("type", type);

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
          <Button className="min-h-11 gap-2">
            <Plus className="size-4" />
            Log task
          </Button>
        }
      />
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Quick log task</SheetTitle>
          <SheetDescription>
            {blockCode} · {blockName}
          </SheetDescription>
        </SheetHeader>
        <form onSubmit={handleSubmit} className="space-y-4 px-4 pb-6">
          <div className="space-y-2">
            <Label htmlFor="quick-type">Task type</Label>
            <select
              id="quick-type"
              value={type}
              onChange={(e) => setType(e.target.value as TaskType)}
              className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
            >
              {QUICK_LOG_TYPES.map((t) => (
                <option key={t} value={t}>
                  {TASK_TYPE_LABELS[t]}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="quick-title">Title (optional)</Label>
            <Input
              id="quick-title"
              name="title"
              className="h-12 text-base"
              placeholder={defaultTitleForType(type, blockCode)}
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
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button type="submit" className="h-12 w-full text-base" disabled={pending}>
            {pending ? "Saving…" : "Save task"}
          </Button>
        </form>
      </SheetContent>
    </Sheet>
  );
}
