"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createIrrigationRecord } from "@/domains/irrigation/actions";
import { IRRIGATION_METHODS } from "@/domains/irrigation/constants";

type BlockOption = { id: string; code: string; name: string };

export function RecordForm({
  blocks,
  defaultBlockId,
}: {
  blocks: BlockOption[];
  defaultBlockId?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const today = new Date().toISOString().split("T")[0];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createIrrigationRecord(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.recordId) {
        router.push(`/irrigation/records/${result.recordId}`);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="blockId">Block</Label>
        <select
          id="blockId"
          name="blockId"
          required
          defaultValue={defaultBlockId ?? blocks[0]?.id}
          className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
        >
          {blocks.map((block) => (
            <option key={block.id} value={block.id}>
              {block.code} — {block.name}
            </option>
          ))}
        </select>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="appliedAt">Applied date</Label>
          <Input
            id="appliedAt"
            name="appliedAt"
            type="date"
            required
            defaultValue={today}
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue="APPLIED"
            className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
          >
            <option value="APPLIED">Applied</option>
            <option value="SCHEDULED">Scheduled</option>
            <option value="MISSED">Missed</option>
            <option value="SKIPPED">Skipped</option>
          </select>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="method">Method</Label>
          <select
            id="method"
            name="method"
            defaultValue="Drip"
            className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
          >
            {IRRIGATION_METHODS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="volume">Volume (gallons)</Label>
          <Input
            id="volume"
            name="volume"
            type="number"
            step="0.1"
            min="0"
            className="h-12 text-base"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="duration">Duration (minutes)</Label>
        <Input
          id="duration"
          name="duration"
          type="number"
          min="0"
          className="h-12 text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea id="notes" name="notes" rows={3} className="text-base" />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" className="min-h-11 flex-1 text-base" disabled={pending}>
          {pending ? "Saving…" : "Save record"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          render={<Link href="/irrigation?view=records" />}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
