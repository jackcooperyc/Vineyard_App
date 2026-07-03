import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RecordForm } from "@/components/irrigation/record-form";
import {
  getBlocksForIrrigationForm,
  getIrrigationRecordById,
} from "@/domains/irrigation/queries";
import { decodeBackParams, encodeBackParams } from "@/lib/hub-back-href";

export default async function EditRecordPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const backQuery = encodeBackParams(decodeBackParams(sp));
  const [record, blocks] = await Promise.all([
    getIrrigationRecordById(id),
    getBlocksForIrrigationForm(),
  ]);

  if (!record) {
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
              href={`/irrigation/records/${record.id}${backQuery}`}
              aria-label="Back to record"
            />
          }
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Edit record</h2>
          <p className="text-sm text-muted-foreground">
            {record.block.code} · {record.block.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Record details</CardTitle>
        </CardHeader>
        <CardContent>
          <RecordForm
            blocks={blocks}
            record={{
              id: record.id,
              blockId: record.blockId,
              appliedAt: record.appliedAt,
              scheduledAt: record.scheduledAt,
              volume: record.volume,
              duration: record.duration,
              method: record.method,
              status: record.status,
              notes: record.notes,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
