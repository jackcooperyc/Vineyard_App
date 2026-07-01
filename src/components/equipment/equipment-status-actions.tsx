"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { updateEquipmentStatus } from "@/domains/equipment/actions";
import type { EquipmentStatus } from "@/generated/prisma/client";

export function EquipmentStatusActions({
  equipmentId,
  status,
}: {
  equipmentId: string;
  status: EquipmentStatus;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function setStatus(next: EquipmentStatus) {
    startTransition(async () => {
      await updateEquipmentStatus(equipmentId, next);
      router.refresh();
    });
  }

  if (status === "RETIRED") {
    return (
      <Button
        variant="outline"
        className="min-h-11"
        disabled={pending}
        onClick={() => setStatus("ACTIVE")}
      >
        Reactivate
      </Button>
    );
  }

  return (
    <div className="flex flex-wrap gap-2">
      {status === "ACTIVE" && (
        <Button
          variant="outline"
          className="min-h-11"
          disabled={pending}
          onClick={() => setStatus("IN_MAINTENANCE")}
        >
          Mark in maintenance
        </Button>
      )}
      {status === "IN_MAINTENANCE" && (
        <Button
          className="min-h-11"
          disabled={pending}
          onClick={() => setStatus("ACTIVE")}
        >
          Mark active
        </Button>
      )}
      <Button
        variant="ghost"
        className="min-h-11 text-muted-foreground"
        disabled={pending}
        onClick={() => setStatus("RETIRED")}
      >
        Retire
      </Button>
    </div>
  );
}
