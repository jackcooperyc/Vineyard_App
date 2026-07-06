"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { updateBlock } from "@/domains/blocks/actions";
import { showBlockSavedToast } from "@/lib/submission-toast";
import type { BlockStatus, GrowthStage } from "@/generated/prisma/client";

type BlockValues = {
  id: string;
  code: string;
  name: string;
  status: BlockStatus;
  acreage: number | null;
  notes: string | null;
  growthStage: GrowthStage | null;
};

export function BlockForm({ block }: { block: BlockValues }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("blockId", block.id);

    startTransition(async () => {
      const result = await updateBlock(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showBlockSavedToast(`${block.code} · ${formData.get("name")}`);
      router.push(`/blocks/${block.id}`);
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <p className="text-sm text-muted-foreground">
        Block code <span className="font-medium text-foreground">{block.code}</span> cannot be changed here.
      </p>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          defaultValue={block.name}
          className="h-12 text-base"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <select
            id="status"
            name="status"
            defaultValue={block.status}
            className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
          >
            <option value="ACTIVE">Active</option>
            <option value="FALLOW">Fallow</option>
            <option value="REPLANTING">Replanting</option>
          </select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="acreage">Acreage</Label>
          <Input
            id="acreage"
            name="acreage"
            type="number"
            step="0.01"
            min="0"
            defaultValue={block.acreage ?? undefined}
            className="h-12 text-base"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="growthStage">Growth stage</Label>
        <select
          id="growthStage"
          name="growthStage"
          defaultValue={block.growthStage ?? ""}
          className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
        >
          <option value="">Not set</option>
          <option value="DORMANT">Dormant</option>
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Block notes (static)</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          defaultValue={block.notes ?? ""}
          className="text-base"
          placeholder="Permanent block description or history…"
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" className="min-h-11 flex-1" disabled={pending}>
          {pending ? "Saving…" : "Save block"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          render={<Link href={`/blocks/${block.id}`} />}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
