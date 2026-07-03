"use client";

import { useState } from "react";
import { Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MaintenanceRecordForm } from "@/components/equipment/maintenance-record-form";

type EquipmentOption = { id: string; name: string; type: string };

export function EquipmentHubQuickLogSheet({
  equipment,
}: {
  equipment: EquipmentOption[];
}) {
  const [open, setOpen] = useState(false);
  const [equipmentId, setEquipmentId] = useState<string>(
    equipment[0]?.id ?? "",
  );

  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && !equipmentId && equipment[0]) {
          setEquipmentId(equipment[0].id);
        }
      }}
    >
      <SheetTrigger
        render={
          <Button variant="outline" className="min-h-11 gap-2">
            <Wrench className="size-4" />
            <span className="hidden sm:inline">Log maintenance</span>
            <span className="sm:hidden">Service</span>
          </Button>
        }
      />
      <SheetContent side="bottom" className="max-h-[85vh] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Log maintenance</SheetTitle>
          <SheetDescription>
            Record service work and update the next due date.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-4">
          {equipment.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No active equipment available. Add equipment first.
            </p>
          ) : (
            <>
              <div className="space-y-2">
                <Label htmlFor="hub-equipmentId">Equipment</Label>
                <select
                  id="hub-equipmentId"
                  value={equipmentId}
                  onChange={(e) => setEquipmentId(e.target.value)}
                  className="flex h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
                >
                  {equipment.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.type})
                    </option>
                  ))}
                </select>
              </div>
              {equipmentId && (
                <MaintenanceRecordForm
                  key={equipmentId}
                  equipmentId={equipmentId}
                  onSuccess={() => setOpen(false)}
                />
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
