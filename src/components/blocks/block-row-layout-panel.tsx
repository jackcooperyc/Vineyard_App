"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  getBlockRowLayoutStatus,
  updateBlockSpacing,
} from "@/domains/block-rows/actions";

type LayoutStatus = Awaited<ReturnType<typeof getBlockRowLayoutStatus>>;

export function BlockRowLayoutPanel({
  blockId,
  initialStatus,
  initialRowSpacing,
  initialVineSpacing,
}: {
  blockId: string;
  initialStatus: LayoutStatus;
  initialRowSpacing: number | null;
  initialVineSpacing: number | null;
}) {
  const [status, setStatus] = useState(initialStatus);
  const [rowSpacing, setRowSpacing] = useState(
    initialRowSpacing?.toString() ?? "",
  );
  const [vineSpacing, setVineSpacing] = useState(
    initialVineSpacing?.toString() ?? "",
  );
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function saveSpacing() {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await updateBlockSpacing({
        blockId,
        rowSpacing: rowSpacing ? Number(rowSpacing) : undefined,
        vineSpacing: vineSpacing ? Number(vineSpacing) : undefined,
      });
      if (result.error) {
        setError(result.error);
        return;
      }
      setMessage("Spacing saved.");
      const next = await getBlockRowLayoutStatus(blockId);
      setStatus(next);
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm">
        <span className="text-muted-foreground">Row data:</span>
        <span className="font-medium">
          {status.status === "gis"
            ? `${status.rowCount} GIS rows imported`
            : status.status === "spacing_only"
              ? "Spacing only (no row geometry)"
              : "Not configured"}
        </span>
      </div>

      {status.status !== "gis" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="rowSpacing">Row spacing (m)</Label>
            <Input
              id="rowSpacing"
              type="number"
              min={0}
              step={0.1}
              value={rowSpacing}
              onChange={(e) => setRowSpacing(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="vineSpacing">Vine spacing (m)</Label>
            <Input
              id="vineSpacing"
              type="number"
              min={0}
              step={0.1}
              value={vineSpacing}
              onChange={(e) => setVineSpacing(e.target.value)}
            />
          </div>
        </div>
      )}

      {status.status !== "gis" && (
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          disabled={pending}
          onClick={saveSpacing}
        >
          {pending ? "Saving…" : "Save spacing"}
        </Button>
      )}

      {status.status === "gis" && (
        <p className="text-xs text-muted-foreground">
          Row geometry is managed via GIS import. Contact admin to update row lines.
        </p>
      )}

      {message && <p className="text-sm text-muted-foreground">{message}</p>}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
