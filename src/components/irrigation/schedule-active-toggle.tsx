"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toggleScheduleActive } from "@/domains/irrigation/actions";
import { showIrrigationScheduleSavedToast } from "@/lib/submission-toast";

export function ScheduleActiveToggle({
  scheduleId,
  active,
}: {
  scheduleId: string;
  active: boolean;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleToggle() {
    startTransition(async () => {
      const result = await toggleScheduleActive(scheduleId, !active);
      if (result.error) return;
      showIrrigationScheduleSavedToast(active ? "Deactivated" : "Activated", {
        isEdit: true,
      });
      router.refresh();
    });
  }

  return (
    <Button
      type="button"
      variant={active ? "outline" : "default"}
      size="sm"
      className="min-h-9 shrink-0"
      disabled={pending}
      onClick={handleToggle}
    >
      {pending ? "…" : active ? "Deactivate" : "Activate"}
    </Button>
  );
}
