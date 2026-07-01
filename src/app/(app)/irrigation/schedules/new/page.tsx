import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScheduleForm } from "@/components/irrigation/schedule-form";
import { getBlocksForIrrigationForm } from "@/domains/irrigation/queries";

export default async function NewSchedulePage({
  searchParams,
}: {
  searchParams: Promise<{ blockId?: string }>;
}) {
  const params = await searchParams;
  const blocks = await getBlocksForIrrigationForm();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          render={<Link href="/irrigation" aria-label="Back to irrigation" />}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">New schedule</h2>
          <p className="text-sm text-muted-foreground">
            Plan recurring irrigation for a block
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Schedule details</CardTitle>
        </CardHeader>
        <CardContent>
          <ScheduleForm blocks={blocks} defaultBlockId={params.blockId} />
        </CardContent>
      </Card>
    </div>
  );
}
