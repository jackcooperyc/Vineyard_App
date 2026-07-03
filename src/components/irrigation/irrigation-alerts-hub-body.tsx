"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";
import { IrrigationAlertCard } from "@/components/irrigation/irrigation-alert-card";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { clearIrrigationAlerts } from "@/domains/irrigation/actions";
import type { IrrigationAlert } from "@/domains/irrigation/queries";

export function IrrigationAlertsHubBody({
  alerts,
  blockId,
  blockCode,
}: {
  alerts: IrrigationAlert[];
  blockId?: string;
  blockCode?: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function handleClearAll() {
    setError(null);
    startTransition(async () => {
      const result = await clearIrrigationAlerts(
        blockId ? { blockId } : undefined,
      );
      if (result.error) {
        setError(result.error);
        return;
      }
      setConfirmOpen(false);
      setMessage(
        result.clearedCount === 0
          ? "No alerts to clear."
          : `Cleared ${result.clearedCount} alert${result.clearedCount !== 1 ? "s" : ""}.`,
      );
      router.refresh();
    });
  }

  if (alerts.length === 0) return null;

  const scopeLabel = blockCode ? `for ${blockCode}` : "on the estate";

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          {alerts.length} overdue schedule{alerts.length !== 1 ? "s" : ""}{" "}
          {blockId ? `for ${blockCode}` : ""}
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="min-h-10 gap-2"
          disabled={pending}
          onClick={() => {
            setError(null);
            setConfirmOpen(true);
          }}
        >
          <XCircle className="size-4" />
          Clear all alerts
        </Button>
      </div>

      {message && (
        <p
          className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/40 dark:text-emerald-100"
          role="status"
        >
          <CheckCircle2 className="size-4 shrink-0" />
          {message}
        </p>
      )}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="space-y-3">
        {alerts.map((alert) => (
          <IrrigationAlertCard key={alert.scheduleId} alert={alert} />
        ))}
      </div>

      <Sheet open={confirmOpen} onOpenChange={setConfirmOpen}>
        <SheetContent side="bottom" className="max-h-[85vh]">
          <SheetHeader>
            <SheetTitle>Clear all irrigation alerts?</SheetTitle>
            <SheetDescription>
              This dismisses {alerts.length} overdue alert
              {alerts.length !== 1 ? "s" : ""} {scopeLabel}. Schedules stay
              active — alerts return if irrigation remains overdue and no new
              record is logged.
            </SheetDescription>
          </SheetHeader>
          {error && (
            <p className="mt-4 text-sm text-destructive" role="alert">
              {error}
            </p>
          )}
          <SheetFooter className="mt-6 flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 flex-1"
              disabled={pending}
              onClick={() => setConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              className="min-h-11 flex-1"
              disabled={pending}
              onClick={() => void handleClearAll()}
            >
              {pending ? "Clearing…" : "Clear all"}
            </Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </>
  );
}
