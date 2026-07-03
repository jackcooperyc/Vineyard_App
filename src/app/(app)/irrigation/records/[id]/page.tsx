import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Droplets, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { IrrigationStatusBadge } from "@/components/irrigation/irrigation-status-badge";
import { getIrrigationRecordById } from "@/domains/irrigation/queries";
import {
  buildIrrigationHubHref,
  decodeBackParams,
  encodeBackParams,
} from "@/lib/hub-back-href";

export default async function RecordDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const backParams = decodeBackParams(sp);
  const backHref = buildIrrigationHubHref({
    ...backParams,
    view: backParams.view ?? "records",
  });
  const editHref = `/irrigation/records/${id}/edit${encodeBackParams(backParams)}`;
  const record = await getIrrigationRecordById(id);

  if (!record) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          render={<Link href={backHref} aria-label="Back to records" />}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Droplets className="size-4 text-primary" />
            <IrrigationStatusBadge status={record.status} />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Irrigation record
          </h2>
          <p className="text-sm text-muted-foreground">
            <Link
              href={`/blocks/${record.block.id}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {record.block.code} · {record.block.name}
            </Link>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="min-h-11 gap-2"
          render={<Link href={editHref} />}
        >
          <Pencil className="size-4" />
          Edit record
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Application details</CardTitle>
          <CardDescription>{record.block.vineyard.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {record.notes && (
            <p className="text-sm whitespace-pre-wrap">{record.notes}</p>
          )}
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Applied</dt>
              <dd className="font-medium">
                {record.appliedAt.toLocaleDateString()}
              </dd>
            </div>
            {record.scheduledAt && (
              <div>
                <dt className="text-muted-foreground">Scheduled</dt>
                <dd className="font-medium">
                  {record.scheduledAt.toLocaleDateString()}
                </dd>
              </div>
            )}
            {record.method && (
              <div>
                <dt className="text-muted-foreground">Method</dt>
                <dd className="font-medium">{record.method}</dd>
              </div>
            )}
            {record.volume != null && (
              <div>
                <dt className="text-muted-foreground">Volume</dt>
                <dd className="font-medium">{record.volume} gallons</dd>
              </div>
            )}
            {record.duration != null && (
              <div>
                <dt className="text-muted-foreground">Duration</dt>
                <dd className="font-medium">{record.duration} minutes</dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="min-h-11"
        render={<Link href={`/blocks/${record.block.id}`} />}
      >
        View block
      </Button>
    </div>
  );
}
