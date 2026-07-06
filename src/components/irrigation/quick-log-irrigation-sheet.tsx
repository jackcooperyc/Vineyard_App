"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Droplets } from "lucide-react";
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
import { quickLogIrrigation } from "@/domains/irrigation/actions";
import { IRRIGATION_METHODS } from "@/domains/irrigation/constants";
import { formatIrrigationQuickLogDetail } from "@/lib/irrigation-toast-detail";
import { showIrrigationLoggedToast } from "@/lib/submission-toast";

export function QuickLogIrrigationSheet({
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
  const [showDetails, setShowDetails] = useState(false);
  const today = new Date().toISOString().split("T")[0];

  function submit(formData: FormData) {
    setError(null);
    formData.set("blockId", blockId);
    startTransition(async () => {
      const result = await quickLogIrrigation(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setOpen(false);
      const method = (formData.get("method") as string | null) || "Drip";
      showIrrigationLoggedToast(
        formatIrrigationQuickLogDetail({
          blockLabel: `${blockCode} · ${blockName}`,
          method,
        }),
      );
      router.refresh();
    });
  }

  function logTodayQuick() {
    const formData = new FormData();
    formData.set("appliedAt", today);
    formData.set("method", "Drip");
    submit(formData);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    submit(new FormData(e.currentTarget));
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" size="touch" className="gap-2">
            <Droplets className="size-4" />
            Log irrigation
          </Button>
        }
      />
      <SheetContent side="bottom" className="max-h-[90dvh] overflow-y-auto rounded-t-xl">
        <SheetHeader>
          <SheetTitle>Log irrigation</SheetTitle>
          <SheetDescription>
            {blockCode} · {blockName}
          </SheetDescription>
        </SheetHeader>
        <div className="space-y-4 px-4 pb-6">
          <Button
            type="button"
            size="touch"
            className="w-full"
            disabled={pending}
            onClick={logTodayQuick}
          >
            {pending ? "Saving…" : "Irrigation applied today"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="h-auto w-full p-0 text-sm text-muted-foreground"
            onClick={() => setShowDetails((v) => !v)}
          >
            {showDetails ? "Hide volume & duration" : "Add volume, duration, or notes"}
          </Button>
          {showDetails && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="hidden" name="appliedAt" value={today} />
              <div className="space-y-2">
                <Label htmlFor="quick-method">Method</Label>
                <select
                  id="quick-method"
                  name="method"
                  defaultValue="Drip"
                  className="field-tap flex h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
                >
                  {IRRIGATION_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="quick-volume">Volume (gallons)</Label>
                  <Input
                    id="quick-volume"
                    name="volume"
                    type="number"
                    step="0.1"
                    min="0"
                    className="h-12 text-base"
                    placeholder="e.g. 400"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="quick-duration">Duration (minutes)</Label>
                  <Input
                    id="quick-duration"
                    name="duration"
                    type="number"
                    min="0"
                    className="h-12 text-base"
                    placeholder="e.g. 120"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="quick-notes">Notes (optional)</Label>
                <Textarea
                  id="quick-notes"
                  name="notes"
                  rows={2}
                  className="text-base"
                  placeholder="Pressure, valve settings…"
                />
              </div>
              <Button type="submit" size="touch" className="w-full" disabled={pending}>
                {pending ? "Saving…" : "Save with details"}
              </Button>
            </form>
          )}
          {error && (
            <p className="text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
