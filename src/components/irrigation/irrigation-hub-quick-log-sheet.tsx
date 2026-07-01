"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Droplets } from "lucide-react";
import { BlockPicker, type BlockPickerItem } from "@/components/shared/block-picker";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { quickLogIrrigation } from "@/domains/irrigation/actions";

export function IrrigationHubQuickLogSheet({
  blocks,
  defaultBlockId,
}: {
  blocks: BlockPickerItem[];
  defaultBlockId?: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [blockId, setBlockId] = useState<string | null>(defaultBlockId ?? null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function logIrrigation() {
    if (!blockId) {
      setError("Select a block first.");
      return;
    }
    setError(null);
    const formData = new FormData();
    formData.set("blockId", blockId);

    startTransition(async () => {
      const result = await quickLogIrrigation(formData);
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
        if (!next) setError(null);
      }}
    >
      <SheetTrigger
        render={
          <Button variant="outline" className="min-h-11 gap-2">
            <Droplets className="size-4" />
            <span className="hidden sm:inline">Log irrigation</span>
            <span className="sm:hidden">Log</span>
          </Button>
        }
      />
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Log irrigation</SheetTitle>
          <SheetDescription>
            Record irrigation applied today for a block.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          <BlockPicker
            blocks={blocks}
            value={blockId}
            onChange={setBlockId}
          />
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <Button
            className="field-tap min-h-12 w-full gap-2"
            disabled={pending || !blockId}
            onClick={logIrrigation}
          >
            <Droplets className="size-4" />
            {pending ? "Saving…" : "Log applied today"}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
