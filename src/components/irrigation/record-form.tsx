"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  createIrrigationRecord,
  updateIrrigationRecord,
} from "@/domains/irrigation/actions";
import { IRRIGATION_METHODS } from "@/domains/irrigation/constants";
import type { IrrigationStatus } from "@/generated/prisma/client";
import { buildIrrigationHubHref } from "@/lib/hub-back-href";

type BlockOption = { id: string; code: string; name: string };

type RecordData = {
  id: string;
  blockId: string;
  appliedAt: Date;
  scheduledAt: Date | null;
  volume: number | null;
  duration: number | null;
  method: string | null;
  status: IrrigationStatus;
  notes: string | null;
};

export function RecordForm({
  blocks,
  defaultBlockId,
  record,
}: {
  blocks: BlockOption[];
  defaultBlockId?: string;
  record?: RecordData;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(record);
  const today = new Date().toISOString().split("T")[0];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    if (record) {
      formData.set("recordId", record.id);
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateIrrigationRecord(formData)
        : await createIrrigationRecord(formData);
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

  const cancelHref = isEdit
    ? `/irrigation/records/${record!.id}`
    : buildIrrigationHubHref({ view: "records" });

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="blockId">Block</Label>
        <select
          id="blockId"
          name="blockId"
          required
          defaultValue={record?.blockId ?? defaultBlockId ?? blocks[0]?.id}
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
            defaultValue={
              record?.appliedAt.toISOString().split("T")[0] ?? today
            }
            className="h-12 text-base"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={record?.status ?? "APPLIED"}
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
            defaultValue={record?.method ?? "Drip"}
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
            defaultValue={record?.volume ?? undefined}
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
          defaultValue={record?.duration ?? undefined}
          className="h-12 text-base"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={record?.notes ?? ""}
          className="text-base"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" className="min-h-11 flex-1 text-base" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save changes" : "Save record"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          render={<Link href={cancelHref} />}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
