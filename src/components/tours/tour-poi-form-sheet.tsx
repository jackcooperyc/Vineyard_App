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
import { Textarea } from "@/components/ui/textarea";
import { SoftDeleteSheet } from "@/components/soft-delete/soft-delete-sheet";
import {
  createTourPOI,
  deleteTourPOI,
  updateTourPOI,
} from "@/domains/tours/actions";
import { TourPOICategoryIcon } from "@/components/tours/tour-poi-icons";
import {
  TOUR_POI_CATEGORIES,
  TOUR_POI_CATEGORY_LABELS,
  type TourPOICategory,
} from "@/domains/tours/constants";
import type { MapTourPOIGeo } from "@/domains/tours/map-geo";

type TourPOIFormSheetProps = {
  open: boolean;
  mode: "create" | "edit" | "view";
  poi: MapTourPOIGeo | null;
  lat: number;
  lng: number;
  canManage: boolean;
  onClose: () => void;
  onSaved?: () => void;
};

export function TourPOIFormSheet({
  open,
  mode,
  poi,
  lat,
  lng,
  canManage,
  onClose,
  onSaved,
}: TourPOIFormSheetProps) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = mode === "edit";
  const isView = mode === "view";
  const readOnly = isView || !canManage;

  const [title, setTitle] = useState(poi?.title ?? "");
  const [description, setDescription] = useState(poi?.description ?? "");
  const [category, setCategory] = useState<TourPOICategory>(
    poi?.category ?? "MILESTONE",
  );

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      onClose();
      setError(null);
    }
  }

  function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (readOnly) return;

    setError(null);
    const formData = new FormData();
    formData.set("title", title.trim());
    formData.set("description", description.trim());
    formData.set("category", category);
    formData.set("lat", String(lat));
    formData.set("lng", String(lng));
    if (isEdit && poi) {
      formData.set("poiId", poi.id);
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateTourPOI(formData)
        : await createTourPOI(formData);

      if (result.error) {
        setError(result.error);
        return;
      }

      onSaved?.();
      onClose();
      router.refresh();
    });
  }

  return (
    <Sheet open={open} onOpenChange={handleOpenChange}>
      <SheetContent side="bottom" className="max-h-[85dvh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <SheetHeader>
            <SheetTitle>
              {isView
                ? poi?.title ?? "Tour POI"
                : isEdit
                  ? "Edit tour POI"
                  : "Add tour POI"}
            </SheetTitle>
            <SheetDescription className="flex items-center gap-2">
              {isView ? (
                <>
                  <TourPOICategoryIcon
                    category={poi?.category ?? "MILESTONE"}
                    className="size-4"
                  />
                  {TOUR_POI_CATEGORY_LABELS[poi?.category ?? "MILESTONE"]}
                </>
              ) : isEdit ? (
                "Update title, description, or category."
              ) : (
                "Name and categorize the pin you placed on the map."
              )}
            </SheetDescription>
          </SheetHeader>

          <div className="space-y-4 px-4 py-4">
            <p className="font-mono text-xs text-muted-foreground">
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </p>

            {readOnly ? (
              <>
                {poi?.description && (
                  <p className="text-sm text-muted-foreground">{poi.description}</p>
                )}
                {!poi?.description && (
                  <p className="text-sm text-muted-foreground italic">
                    No description
                  </p>
                )}
              </>
            ) : (
              <>
                <div className="space-y-2">
                  <Label htmlFor="tour-poi-title">Title</Label>
                  <Input
                    id="tour-poi-title"
                    value={title}
                    onChange={(event) => setTitle(event.target.value)}
                    placeholder="e.g. Estate entrance milestone"
                    required
                    maxLength={200}
                    autoFocus
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="tour-poi-description">
                    Description (optional)
                  </Label>
                  <Textarea
                    id="tour-poi-description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                    placeholder="Importance, sentiment, or talking points…"
                    rows={3}
                    maxLength={2000}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={category}
                    onValueChange={(value) => {
                      if (value) setCategory(value as TourPOICategory);
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue>
                        <span className="flex items-center gap-2">
                          <TourPOICategoryIcon
                            category={category}
                            className="size-4"
                          />
                          {TOUR_POI_CATEGORY_LABELS[category]}
                        </span>
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {TOUR_POI_CATEGORIES.map((option) => (
                        <SelectItem key={option} value={option}>
                          <span className="flex items-center gap-2">
                            <TourPOICategoryIcon
                              category={option}
                              className="size-4"
                            />
                            {TOUR_POI_CATEGORY_LABELS[option]}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}

            {error && (
              <p className="text-sm text-destructive" role="alert">
                {error}
              </p>
            )}
          </div>

          <SheetFooter className="flex-row gap-2">
            {readOnly ? (
              <Button
                type="button"
                variant="outline"
                className="min-h-11 flex-1"
                onClick={onClose}
              >
                Close
              </Button>
            ) : (
              <>
                {isEdit && poi && (
                  <SoftDeleteSheet
                    title={`Delete "${poi.title}"?`}
                    description="This tour point of interest will be permanently removed."
                    triggerLabel="Delete"
                    confirmLabel="Delete"
                    pendingLabel="Deleting…"
                    variant="outline"
                    onDelete={() => deleteTourPOI(poi.id)}
                    onSuccess={() => {
                      onClose();
                      router.refresh();
                    }}
                  />
                )}
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
                  disabled={pending}
                >
                  {pending ? "Saving…" : isEdit ? "Save changes" : "Add POI"}
                </Button>
              </>
            )}
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
