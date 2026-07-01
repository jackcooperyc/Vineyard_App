"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createMaintenanceRecord } from "@/domains/equipment/actions";

export function MaintenanceRecordForm({
  equipmentId,
}: {
  equipmentId: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("equipmentId", equipmentId);

    startTransition(async () => {
      const result = await createMaintenanceRecord(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.refresh();
      e.currentTarget.reset();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="performedAt">Service date</Label>
        <Input
          id="performedAt"
          name="performedAt"
          type="date"
          required
          defaultValue={today}
          className="h-12 text-base"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Work performed</Label>
        <Input
          id="description"
          name="description"
          className="h-12 text-base"
          placeholder="e.g. Oil change, filter replacement"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="nextServiceAt">Next service due</Label>
        <Input
          id="nextServiceAt"
          name="nextServiceAt"
          type="date"
          className="h-12 text-base"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={2}
          className="text-base"
          placeholder="Parts used, vendor, hours…"
        />
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" className="min-h-11 w-full text-base" disabled={pending}>
        {pending ? "Saving…" : "Log maintenance"}
      </Button>
    </form>
  );
}
