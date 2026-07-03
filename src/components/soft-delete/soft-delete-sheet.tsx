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

const DEFAULT_DESCRIPTION =
  "This record will be hidden from normal views. You can restore it within 48 hours from Recently deleted.";

export function SoftDeleteSheet({
  title,
  description = DEFAULT_DESCRIPTION,
  triggerLabel,
  confirmLabel = "Delete",
  pendingLabel = "Deleting…",
  variant = "ghost",
  onDelete,
  onSuccess,
}: {
  title: string;
  description?: string;
  triggerLabel: string;
  confirmLabel?: string;
  pendingLabel?: string;
  variant?: "ghost" | "outline" | "destructive";
  onDelete: () => Promise<{ error?: string; success?: boolean }>;
  onSuccess?: () => void;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleDelete() {
    setError(null);
    startTransition(async () => {
      const result = await onDelete();
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      onSuccess?.();
      router.refresh();
    });
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button
            variant={variant}
            className={
              variant === "ghost"
                ? "min-h-11 gap-2 text-destructive"
                : "min-h-11 gap-2"
            }
          >
            <Trash2 className="size-4" />
            {triggerLabel}
          </Button>
        }
      />
      <SheetContent side="bottom" className="max-h-[50vh]">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          <SheetDescription>{description}</SheetDescription>
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
            {pending ? pendingLabel : confirmLabel}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
