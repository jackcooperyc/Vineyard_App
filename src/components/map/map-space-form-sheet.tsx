"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { createMapSpace, updateMapSpace } from "@/domains/map/actions";
import { MAP_SPACE_CATEGORIES } from "@/domains/map/constants";
import type { MapBlockGeometry } from "@/domains/map/types";
import type { MapSpaceCategory } from "@/domains/map/constants";

type MapSpaceFormSheetProps = {
  open: boolean;
  mode: "create" | "edit";
  geometry: MapBlockGeometry | null;
  blockId?: string;
  defaultName?: string;
  defaultCategory?: string;
  onClose: () => void;
  onSaved?: (blockId: string) => void;
};

export function MapSpaceFormSheet({
  open,
  mode,
  geometry,
  blockId,
  defaultName = "",
  defaultCategory = "Shop",
  onClose,
  onSaved,
}: MapSpaceFormSheetProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(defaultName);
  const [category, setCategory] = useState<MapSpaceCategory>(
    MAP_SPACE_CATEGORIES.includes(defaultCategory as MapSpaceCategory)
      ? (defaultCategory as MapSpaceCategory)
      : "Shop",
  );

  const isEdit = mode === "edit";

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      onClose();
      setError(null);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!geometry && !isEdit) return;

    setError(null);
    startTransition(async () => {
      const result = isEdit && blockId
        ? await updateMapSpace({
            blockId,
            name: name.trim(),
            category,
            ...(geometry ? { geometry } : {}),
          })
        : geometry
          ? await createMapSpace({
              name: name.trim(),
              category,
              geometry,
            })
          : { error: "Missing polygon geometry" };

      if (result.error) {
        setError(result.error);
        return;
      }

      if (result.blockId) {
        onSaved?.(result.blockId);
      }
      onClose();
      router.refresh();
    });
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto">
        <form onSubmit={handleSubmit} key={`${mode}-${blockId ?? "new"}-${defaultName}`}>
          <SheetHeader>
            <SheetTitle>{isEdit ? "Edit map space" : "Save map space"}</SheetTitle>
            <SheetDescription>
              {isEdit
                ? "Update the label and category for this area."
                : "Name and categorize the polygon you drew on the map."}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="space-name">Name</Label>
              <Input
                id="space-name"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="e.g. Farm Shop"
                required
                maxLength={200}
                autoFocus
              />
            </div>

            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={category}
                onValueChange={(value) => {
                  if (value) setCategory(value as MapSpaceCategory);
                }}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {MAP_SPACE_CATEGORIES.map((option) => (
                    <SelectItem key={option} value={option}>
                      {option}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <SheetFooter className="flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 flex-1"
              disabled={pending}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-h-11 flex-1"
              disabled={pending || (!geometry && !isEdit)}
            >
              {pending ? "Saving…" : isEdit ? "Save changes" : "Create space"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
