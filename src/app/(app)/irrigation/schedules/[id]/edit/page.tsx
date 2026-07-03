import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleForm } from "@/components/irrigation/schedule-form";
import {
  getBlocksForIrrigationForm,
  getIrrigationScheduleById,
} from "@/domains/irrigation/queries";
import { decodeBackParams, encodeBackParams } from "@/lib/hub-back-href";

export default async function EditSchedulePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const backQuery = encodeBackParams(decodeBackParams(sp));
  const [schedule, blocks] = await Promise.all([
    getIrrigationScheduleById(id),
    getBlocksForIrrigationForm(),
  ]);

  if (!schedule) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          render={
            <Link
              href={`/irrigation/schedules/${schedule.id}${backQuery}`}
              aria-label="Back to schedule"
            />
          }
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Edit schedule</h2>
          <p className="text-sm text-muted-foreground">
            {schedule.block.code} · {schedule.block.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule details</CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleForm
            blocks={blocks}
            schedule={{
              id: schedule.id,
              blockId: schedule.blockId,
              frequency: schedule.frequency,
              startDate: schedule.startDate,
              volume: schedule.volume,
              method: schedule.method,
              notes: schedule.notes,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
