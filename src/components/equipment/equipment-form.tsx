"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Camera, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { EquipmentPhoto } from "@/components/equipment/equipment-photo";
import { createEquipment, updateEquipment } from "@/domains/equipment/actions";
import {
  EQUIPMENT_STATUSES,
  EQUIPMENT_STATUS_LABELS,
  EQUIPMENT_TYPES,
} from "@/domains/equipment/constants";
import type { EquipmentStatus } from "@/generated/prisma/client";

type EquipmentValues = {
  id: string;
  name: string;
  type: string;
  status: EquipmentStatus;
  serialNumber: string | null;
  photoUrl: string | null;
  lastServicedAt: Date | null;
  nextServiceAt: Date | null;
  notes: string | null;
};

function formatDateInput(date: Date | null): string {
  if (!date) return "";
  return date.toISOString().slice(0, 10);
}

export function EquipmentForm({ equipment }: { equipment?: EquipmentValues }) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(
    equipment?.photoUrl ?? null,
  );
  const [clearPhoto, setClearPhoto] = useState(false);
  const isEdit = Boolean(equipment);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(URL.createObjectURL(file));
    setClearPhoto(false);
  }

  function handleRemovePhoto() {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }

    setPreviewUrl(null);
    setClearPhoto(true);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("clearPhoto", clearPhoto ? "true" : "false");

    startTransition(async () => {
      const result = isEdit
        ? await updateEquipment(formData)
        : await createEquipment(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      if (result.equipmentId) {
        router.push(`/equipment/${result.equipmentId}`);
        router.refresh();
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {equipment && (
        <input type="hidden" name="equipmentId" value={equipment.id} />
      )}
      <input type="hidden" name="clearPhoto" value={clearPhoto ? "true" : "false"} />

      <div className="space-y-3">
        <Label htmlFor="photo">Photo (optional)</Label>
        <div className="flex items-start gap-4">
          <EquipmentPhoto
            photoUrl={previewUrl}
            name={equipment?.name ?? "Equipment"}
            type={equipment?.type ?? "Tractor"}
            className="size-24 shrink-0 rounded-xl"
            iconClassName="size-8"
          />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <Input
              ref={fileInputRef}
              id="photo"
              name="photo"
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="h-12 text-base file:mr-3 file:rounded-md file:border-0 file:bg-muted file:px-3 file:py-1.5 file:text-sm file:font-medium"
              onChange={handlePhotoChange}
            />
            <p className="text-xs text-muted-foreground">
              JPEG, PNG, or WebP up to 5 MB
            </p>
            {previewUrl && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="w-fit gap-1.5"
                onClick={handleRemovePhoto}
              >
                <X className="size-3.5" />
                Remove photo
              </Button>
            )}
            {!previewUrl && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Camera className="size-3.5" />
                Add a photo to identify this asset in the field
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="name">Name</Label>
        <Input
          id="name"
          name="name"
          required
          className="h-12 text-base"
          placeholder="e.g. Kubota M5-111"
          defaultValue={equipment?.name}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="type">Type</Label>
        <select
          id="type"
          name="type"
          required
          defaultValue={equipment?.type ?? "Tractor"}
          className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
        >
          {EQUIPMENT_TYPES.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">Status</Label>
        <select
          id="status"
          name="status"
          defaultValue={equipment?.status ?? "ACTIVE"}
          className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
        >
          {EQUIPMENT_STATUSES.map((status) => (
            <option key={status} value={status}>
              {EQUIPMENT_STATUS_LABELS[status as EquipmentStatus]}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="serialNumber">Serial number (optional)</Label>
        <Input
          id="serialNumber"
          name="serialNumber"
          className="h-12 text-base"
          placeholder="Internal ID or manufacturer S/N"
          defaultValue={equipment?.serialNumber ?? ""}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="lastServicedAt">Last serviced</Label>
          <Input
            id="lastServicedAt"
            name="lastServicedAt"
            type="date"
            className="h-12 text-base"
            defaultValue={formatDateInput(equipment?.lastServicedAt ?? null)}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="nextServiceAt">Next service due</Label>
          <Input
            id="nextServiceAt"
            name="nextServiceAt"
            type="date"
            className="h-12 text-base"
            defaultValue={formatDateInput(equipment?.nextServiceAt ?? null)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          name="notes"
          rows={3}
          className="text-base"
          placeholder="Maintenance notes, location, etc."
          defaultValue={equipment?.notes ?? ""}
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
              : "Add equipment"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          render={
            <Link href={equipment ? `/equipment/${equipment.id}` : "/equipment"} />
          }
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
