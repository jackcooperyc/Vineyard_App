"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PumpLocationPicker } from "@/components/pumps/pump-location-picker";
import {
  createIrrigationPump,
  updateIrrigationPump,
} from "@/domains/pumps/actions";
import { ESTATE_WEATHER_LOCATION } from "@/domains/weather/constants";

type BlockOption = { id: string; code: string; name: string };

type PumpFormValues = {
  id: string;
  name: string | null;
  lat: number;
  lng: number;
  flowCapacity: number | null;
  servicedBlockIds: string[];
  notes: string | null;
};

export function PumpForm({
  blocks,
  pump,
  mapboxToken,
  cancelHref = "/pumps",
}: {
  blocks: BlockOption[];
  pump?: PumpFormValues;
  mapboxToken?: string;
  cancelHref?: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(pump);

  const [lat, setLat] = useState(pump?.lat ?? ESTATE_WEATHER_LOCATION.lat);
  const [lng, setLng] = useState(pump?.lng ?? ESTATE_WEATHER_LOCATION.lng);

  function handleLocationChange(newLat: number, newLng: number) {
    setLat(newLat);
    setLng(newLng);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("lat", String(lat));
    formData.set("lng", String(lng));

    startTransition(async () => {
      const result = isEdit
        ? await updateIrrigationPump(formData)
        : await createIrrigationPump(formData);
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
      {pump && <input type="hidden" name="pumpId" value={pump.id} />}

      <div className="space-y-2">
        <Label htmlFor="name">Pump name</Label>
        <Input
          id="name"
          name="name"
          required
          className="h-12 text-base"
          placeholder="e.g. Main station pump"
          defaultValue={pump?.name ?? ""}
        />
      </div>

      <div className="space-y-2">
        <Label>Location</Label>
        {mapboxToken ? (
          <PumpLocationPicker
            token={mapboxToken}
            lat={lat}
            lng={lng}
            onChange={handleLocationChange}
          />
        ) : (
          <p className="text-sm text-muted-foreground">
            Map picker unavailable — enter coordinates below.
          </p>
        )}
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
              value={lat}
              onChange={(e) => setLat(Number(e.target.value))}
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
              value={lng}
              onChange={(e) => setLng(Number(e.target.value))}
            />
          </div>
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
          defaultValue={pump?.flowCapacity ?? ""}
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
                  defaultChecked={pump?.servicedBlockIds.includes(block.id)}
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
          defaultValue={pump?.notes ?? ""}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" className="min-h-11 flex-1 text-base" disabled={pending}>
          {pending
            ? isEdit
              ? "Saving…"
              : "Creating…"
            : isEdit
              ? "Save changes"
              : "Add pump"}
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
