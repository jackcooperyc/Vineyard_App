"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createPlanting,
  deletePlanting,
  updatePlanting,
} from "@/domains/blocks/actions";

type VarietyOption = { id: string; name: string };

type PlantingItem = {
  id: string;
  varietyId: string;
  vineCount: number | null;
  yearPlanted: number | null;
  rootstock: string | null;
  rowSpacing: number | null;
  vineSpacing: number | null;
  variety: { id: string; name: string };
};

export function BlockPlantingsEditor({
  blockId,
  plantings,
  varieties,
}: {
  blockId: string;
  plantings: PlantingItem[];
  varieties: VarietyOption[];
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  function runAction(action: () => Promise<{ error?: string }>) {
    setError(null);
    startTransition(async () => {
      const result = await action();
      if (result.error) {
        setError(result.error);
        return;
      }
      setEditingId(null);
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      {plantings.length === 0 && (
        <p className="text-sm text-muted-foreground">
          No plantings recorded. Add a variety planting below.
        </p>
      )}

      {plantings.map((planting) => (
        <div key={planting.id} className="rounded-lg border p-4">
          {editingId === planting.id ? (
            <PlantingFields
              blockId={blockId}
              plantingId={planting.id}
              varieties={varieties}
              defaultValues={planting}
              pending={pending}
              onCancel={() => setEditingId(null)}
              onSubmit={(formData) =>
                runAction(async () => updatePlanting(formData))
              }
            />
          ) : (
            <div className="flex items-start justify-between gap-3">
              <div className="space-y-1 text-sm">
                <p className="font-medium">{planting.variety.name}</p>
                <p className="text-muted-foreground">
                  {planting.vineCount != null
                    ? `${planting.vineCount.toLocaleString()} vines`
                    : "Vine count not set"}
                  {planting.yearPlanted != null && ` · Planted ${planting.yearPlanted}`}
                  {planting.rootstock && ` · ${planting.rootstock}`}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setEditingId(planting.id)}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="size-9 shrink-0"
                  disabled={pending}
                  onClick={() => {
                    const formData = new FormData();
                    formData.set("plantingId", planting.id);
                    formData.set("blockId", blockId);
                    runAction(async () => deletePlanting(formData));
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}

      <div className="rounded-lg border border-dashed p-4">
        <p className="mb-3 text-sm font-medium">Add planting</p>
        <PlantingFields
          blockId={blockId}
          varieties={varieties}
          pending={pending}
          onSubmit={(formData) => runAction(async () => createPlanting(formData))}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function PlantingFields({
  blockId,
  plantingId,
  varieties,
  defaultValues,
  pending,
  onCancel,
  onSubmit,
}: {
  blockId: string;
  plantingId?: string;
  varieties: VarietyOption[];
  defaultValues?: PlantingItem;
  pending: boolean;
  onCancel?: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("blockId", blockId);
    if (plantingId) formData.set("plantingId", plantingId);
    onSubmit(formData);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="space-y-2">
        <Label>Variety</Label>
        <select
          name="varietyId"
          required
          defaultValue={defaultValues?.varietyId ?? varieties[0]?.id}
          className="flex h-11 w-full rounded-lg border border-input bg-background px-3 text-base"
        >
          {varieties.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label>Vine count</Label>
          <Input
            name="vineCount"
            type="number"
            min="0"
            defaultValue={defaultValues?.vineCount ?? undefined}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label>Year planted</Label>
          <Input
            name="yearPlanted"
            type="number"
            min="1900"
            max="2100"
            defaultValue={defaultValues?.yearPlanted ?? undefined}
            className="h-11"
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Rootstock</Label>
        <Input
          name="rootstock"
          defaultValue={defaultValues?.rootstock ?? ""}
          className="h-11"
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" size="sm" disabled={pending}>
          {pending ? "Saving…" : plantingId ? "Save planting" : "Add planting"}
        </Button>
        {onCancel && (
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancel
          </Button>
        )}
      </div>
    </form>
  );
}
