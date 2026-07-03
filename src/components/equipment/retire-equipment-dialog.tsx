"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Archive } from "lucide-react";
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
import { retireEquipment } from "@/domains/equipment/actions";

export function RetireEquipmentDialog({
  equipmentId,
  equipmentName,
}: {
  equipmentId: string;
  equipmentName: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleRetire() {
    setError(null);
    startTransition(async () => {
      const result = await retireEquipment(equipmentId);
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
          <Button variant="ghost" className="min-h-11 gap-2 text-muted-foreground">
            <Archive className="size-4" />
            Retire equipment
          </Button>
        }
      />
      <SheetContent side="bottom" className="max-h-[50vh]">
        <SheetHeader>
          <SheetTitle>Retire equipment?</SheetTitle>
          <SheetDescription>
            Mark &ldquo;{equipmentName}&rdquo; as retired. Open tasks will keep
            their link but the asset will no longer appear in active pickers.
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
            className="min-h-11 flex-1"
            disabled={pending}
            onClick={handleRetire}
          >
            {pending ? "Retiring…" : "Retire"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
