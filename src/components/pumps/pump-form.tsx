"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createIrrigationPump } from "@/domains/pumps/actions";
import { ESTATE_WEATHER_LOCATION } from "@/domains/weather/constants";

type BlockOption = { id: string; code: string; name: string };

export function PumpForm({ blocks }: { blocks: BlockOption[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await createIrrigationPump(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.pumpId) {
        router.push(`/pumps/${result.pumpId}`);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="name">Pump name</Label>
        <Input
          id="name"
          name="name"
          required
          className="h-12 text-base"
          placeholder="e.g. Main station pump"
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lat">Latitude</Label>
          <Input
            id="lat"
            name="lat"
            type="number"
            step="any"
            required
            className="h-12 text-base"
            defaultValue={ESTATE_WEATHER_LOCATION.lat}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="lng">Longitude</Label>
          <Input
            id="lng"
            name="lng"
            type="number"
            step="any"
            required
            className="h-12 text-base"
            defaultValue={ESTATE_WEATHER_LOCATION.lng}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="flowCapacity">Flow capacity (GPM, optional)</Label>
        <Input
          id="flowCapacity"
          name="flowCapacity"
          type="number"
          step="any"
          min="0"
          className="h-12 text-base"
          placeholder="e.g. 150"
        />
      </div>

      <div className="space-y-2">
        <Label>Serviced blocks (optional)</Label>
        <div className="max-h-48 space-y-2 overflow-y-auto rounded-lg border p-3">
          {blocks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No vineyard blocks found.</p>
          ) : (
            blocks.map((block) => (
              <label
                key={block.id}
                className="flex min-h-10 cursor-pointer items-center gap-2 text-sm"
              >
                <input
                  type="checkbox"
                  name="servicedBlockIds"
                  value={block.id}
                  className="size-4 rounded border-input"
                />
                <span>
                  {block.code} — {block.name}
                </span>
              </label>
            ))
          )}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          className="text-base"
          placeholder="Location notes, valve IDs, etc."
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" className="min-h-11 flex-1 text-base" disabled={pending}>
          {pending ? "Creating…" : "Add pump"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          render={<Link href="/pumps" />}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
