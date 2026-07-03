"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

export function RestoreRecordButton({
  label = "Restore",
  disabled,
  onRestore,
}: {
  label?: string;
  disabled?: boolean;
  onRestore: () => Promise<{ error?: string; success?: boolean }>;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleRestore() {
    startTransition(async () => {
      const result = await onRestore();
      if (!result.error) {
        router.refresh();
      }
    });
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className="min-h-9 gap-1.5"
      disabled={disabled || pending}
      onClick={handleRestore}
    >
      <RotateCcw className="size-3.5" />
      {pending ? "Restoring…" : label}
    </Button>
  );
}
