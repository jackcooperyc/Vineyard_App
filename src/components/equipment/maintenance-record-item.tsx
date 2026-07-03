"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { DeleteMaintenanceRecordDialog } from "@/components/equipment/delete-maintenance-record-dialog";
import { updateMaintenanceRecord } from "@/domains/equipment/actions";

type MaintenanceRecordItemProps = {
  record: {
    id: string;
    performedAt: Date;
    description: string | null;
    notes: string | null;
  };
  equipmentId: string;
};

export function MaintenanceRecordItem({
  record,
  equipmentId,
}: MaintenanceRecordItemProps) {
  const router = useRouter();
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const performedDate = record.performedAt.toISOString().split("T")[0];

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("recordId", record.id);
    formData.set("equipmentId", equipmentId);

    startTransition(async () => {
      const result = await updateMaintenanceRecord(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setEditing(false);
      router.refresh();
    });
  }

  if (editing) {
    return (
      <form
        onSubmit={handleSubmit}
        className="rounded-lg border bg-muted/20 p-4 space-y-3"
      >
        <div className="space-y-2">
          <Label htmlFor={`performedAt-${record.id}`}>Service date</Label>
          <Input
            id={`performedAt-${record.id}`}
            name="performedAt"
            type="date"
            required
            defaultValue={performedDate}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`description-${record.id}`}>Work performed</Label>
          <Input
            id={`description-${record.id}`}
            name="description"
            defaultValue={record.description ?? ""}
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor={`notes-${record.id}`}>Notes</Label>
          <Textarea
            id={`notes-${record.id}`}
            name="notes"
            rows={2}
            defaultValue={record.notes ?? ""}
          />
        </div>
        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
        <div className="flex gap-2">
          <Button type="submit" className="min-h-10" disabled={pending}>
            {pending ? "Saving…" : "Save"}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="min-h-10"
            disabled={pending}
            onClick={() => setEditing(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-lg border bg-muted/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="font-medium">
          {record.description ?? "Maintenance service"}
        </p>
        <div className="flex shrink-0 items-center gap-2">
          <time
            dateTime={record.performedAt.toISOString()}
            className="text-xs text-muted-foreground"
          >
            {record.performedAt.toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </time>
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Edit maintenance record"
            onClick={() => setEditing(true)}
          >
            <Pencil className="size-3.5" />
          </Button>
          <DeleteMaintenanceRecordDialog
            recordId={record.id}
            equipmentId={equipmentId}
            description={record.description}
          />
        </div>
      </div>
      {record.notes && (
        <p className="mt-2 text-sm text-muted-foreground">{record.notes}</p>
      )}
    </div>
  );
}
