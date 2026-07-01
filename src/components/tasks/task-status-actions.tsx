"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Check, Play } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  markTaskComplete,
  startTask,
  updateTaskStatus,
} from "@/domains/tasks/actions";
import type { TaskStatus } from "@/generated/prisma/client";

export function TaskStatusActions({
  taskId,
  status,
}: {
  taskId: string;
  status: TaskStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function runAction(action: () => Promise<{ error?: string; success?: boolean }>) {
    startTransition(async () => {
      await action();
      router.refresh();
    });
  }

  if (status === "COMPLETED" || status === "CANCELLED") {
    return (
      <Button
        variant="outline"
        className="min-h-11"
        disabled={pending}
        onClick={() => runAction(() => updateTaskStatus(taskId, "PENDING"))}
      >
        Reopen
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "PENDING" && (
        <Button
          className="min-h-11 gap-2"
          disabled={pending}
          onClick={() => runAction(() => startTask(taskId))}
        >
          <Play className="size-4" />
          Start
        </Button>
      )}
      {status === "IN_PROGRESS" && (
        <Button
          className="min-h-11 gap-2"
          disabled={pending}
          onClick={() => runAction(() => markTaskComplete(taskId))}
        >
          <Check className="size-4" />
          Complete
        </Button>
      )}
      {status === "PENDING" && (
        <Button
          variant="outline"
          className="min-h-11 gap-2"
          disabled={pending}
          onClick={() => runAction(() => markTaskComplete(taskId))}
        >
          <Check className="size-4" />
          Mark complete
        </Button>
      )}
      <Button
        variant="ghost"
        className="min-h-11 text-muted-foreground"
        disabled={pending}
        onClick={() => runAction(() => updateTaskStatus(taskId, "CANCELLED"))}
      >
        Cancel
      </Button>
    </div>
  );
}
