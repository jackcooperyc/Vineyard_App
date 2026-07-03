"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { deleteTask } from "@/domains/tasks/actions";
import { buildTasksHubHref } from "@/lib/hub-back-href";
import type { TasksHubParams } from "@/lib/hub-back-href";

export function DeleteTaskDialog({
  taskId,
  taskTitle,
  backParams = {},
}: {
  taskId: string;
  taskTitle: string;
  backParams?: TasksHubParams;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await deleteTask(taskId);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      router.push(buildTasksHubHref(backParams));
      router.refresh();
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="ghost" className="min-h-11 gap-2 text-destructive">
            <Trash2 className="size-4" />
            Delete task
          </Button>
        }
      />
      <SheetContent side="bottom" className="max-h-[50vh]">
        <SheetHeader>
          <SheetTitle>Delete task?</SheetTitle>
          <SheetDescription>
            Permanently remove &ldquo;{taskTitle}&rdquo;. This cannot be undone.
          </SheetDescription>
        </SheetHeader>
        {error && (
          <p className="px-4 text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <SheetFooter className="flex-row gap-2">
          <Button
            variant="outline"
            className="min-h-11 flex-1"
            disabled={pending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            className="min-h-11 flex-1"
            disabled={pending}
            onClick={handleDelete}
          >
            {pending ? "Deleting…" : "Delete"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
