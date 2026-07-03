import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Clock, Droplets, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScheduleActiveToggle } from "@/components/irrigation/schedule-active-toggle";
import { DeleteIrrigationScheduleDialog } from "@/components/irrigation/delete-irrigation-schedule-dialog";
import { IrrigationStatusBadge } from "@/components/irrigation/irrigation-status-badge";
import { IRRIGATION_FREQUENCIES } from "@/domains/irrigation/constants";
import {
  getIrrigationScheduleById,
  getRecentIrrigationByBlock,
  getScheduleDueHintById,
  getPumpsForBlock,
} from "@/domains/irrigation/queries";
import {
  buildIrrigationHubHref,
  decodeBackParams,
  encodeBackParams,
} from "@/lib/hub-back-href";
import { cn } from "@/lib/utils";

function frequencyLabel(value: string) {
  return IRRIGATION_FREQUENCIES.find((f) => f.value === value)?.label ?? value;
}

function dueHintText(schedule: NonNullable<Awaited<ReturnType<typeof getScheduleDueHintById>>>) {
  if (!schedule.active) return null;

  const expectedDays =
    IRRIGATION_FREQUENCIES.find((f) => f.value === schedule.frequency)?.days ?? 7;

  if (schedule.isOverdue) {
    const overdueBy =
      schedule.daysSinceLast != null
        ? schedule.daysSinceLast - expectedDays
        : null;
    return {
      text:
        overdueBy != null && overdueBy > 0
          ? `${overdueBy} day${overdueBy !== 1 ? "s" : ""} overdue`
          : "Overdue",
      tone: "danger" as const,
    };
  }

  if (schedule.daysSinceLast != null) {
    const daysUntil = expectedDays - schedule.daysSinceLast;
    if (daysUntil <= 3) {
      return {
        text:
          daysUntil <= 0
            ? "Due now"
            : `Due in ${daysUntil} day${daysUntil !== 1 ? "s" : ""}`,
        tone: daysUntil <= 1 ? ("warning" as const) : ("default" as const),
      };
    }
  }

  return null;
}

export default async function ScheduleDetailPage({
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
    view: backParams.view ?? "schedules",
  });
  const editHref = `/irrigation/schedules/${id}/edit${encodeBackParams(backParams)}`;

  const schedule = await getIrrigationScheduleById(id);

  if (!schedule) {
    notFound();
  }

  const [recentRecords, dueHint, pumps] = await Promise.all([
    getRecentIrrigationByBlock(schedule.blockId, 5),
    getScheduleDueHintById(id),
    getPumpsForBlock(schedule.blockId),
  ]);

  const hint = dueHint ? dueHintText(dueHint) : null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          render={<Link href={backHref} aria-label="Back to irrigation" />}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{frequencyLabel(schedule.frequency)}</Badge>
            {schedule.active ? (
              <Badge variant="outline" className="border-green-600 text-green-700">
                Active
              </Badge>
            ) : (
              <Badge variant="outline" className="text-muted-foreground">
                Inactive
              </Badge>
            )}
            {hint && (
              <Badge
                variant="outline"
                className={cn(
                  hint.tone === "danger" &&
                    "border-red-300 bg-red-50 text-red-800 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-100",
                  hint.tone === "warning" &&
                    "border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-100",
                )}
              >
                <Clock className="mr-1 size-3" />
                {hint.text}
              </Badge>
            )}
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">
            Irrigation schedule
          </h2>
          <p className="text-sm text-muted-foreground">
            <Link
              href={`/blocks/${schedule.block.id}`}
              className="text-primary underline-offset-4 hover:underline"
            >
              {schedule.block.code} · {schedule.block.name}
            </Link>
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <ScheduleActiveToggle scheduleId={schedule.id} active={schedule.active} />
        <Button
          variant="outline"
          className="min-h-11 gap-2"
          render={<Link href={editHref} />}
        >
          <Pencil className="size-4" />
          Edit schedule
        </Button>
        <DeleteIrrigationScheduleDialog
          scheduleId={schedule.id}
          backParams={backParams}
        />
      </div>

      {pumps.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Served by pump{pumps.length !== 1 ? "s" : ""}:{" "}
          {pumps.map((pump, i) => (
            <span key={pump.id}>
              {i > 0 && ", "}
              <Link
                href={`/pumps/${pump.id}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                {pump.name ?? "Unnamed pump"}
              </Link>
            </span>
          ))}
        </p>
      )}

      <Card className={schedule.active ? "" : "opacity-80"}>
        <CardHeader>
          <CardTitle>Schedule details</CardTitle>
          <CardDescription>{schedule.block.vineyard.name}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {schedule.notes && (
            <p className="text-sm whitespace-pre-wrap">{schedule.notes}</p>
          )}
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <div>
                <dt className="text-muted-foreground">Start date</dt>
                <dd className="font-medium">
                  {schedule.startDate.toLocaleDateString()}
                </dd>
              </div>
            </div>
            {dueHint?.lastAppliedAt && (
              <div className="flex items-center gap-2">
                <Clock className="size-4 text-muted-foreground" />
                <div>
                  <dt className="text-muted-foreground">Last applied</dt>
                  <dd className="font-medium">
                    {dueHint.lastAppliedAt.toLocaleDateString()}
                  </dd>
                </div>
              </div>
            )}
            {schedule.method && (
              <div>
                <dt className="text-muted-foreground">Method</dt>
                <dd className="font-medium">{schedule.method}</dd>
              </div>
            )}
            {schedule.volume != null && (
              <div>
                <dt className="text-muted-foreground">Volume</dt>
                <dd className="font-medium">{schedule.volume} gallons</dd>
              </div>
            )}
            <div>
              <dt className="text-muted-foreground">Frequency</dt>
              <dd className="font-medium">
                {frequencyLabel(schedule.frequency)}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Recent irrigation</CardTitle>
            <CardDescription>
              Latest records for {schedule.block.code}
            </CardDescription>
          </div>
          <Button
            variant="link"
            className="h-auto p-0"
            render={
              <Link
                href={`/irrigation?view=records&blockId=${schedule.block.id}`}
              />
            }
          >
            View all
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No irrigation logged for this block yet.{" "}
              <Link
                href={`/irrigation/records/new?blockId=${schedule.block.id}`}
                className="text-primary underline-offset-4 hover:underline"
              >
                Log irrigation
              </Link>
            </p>
          ) : (
            recentRecords.map((record) => (
              <Link
                key={record.id}
                href={`/irrigation/records/${record.id}`}
                className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 last:border-0 hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Droplets className="size-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      {record.appliedAt.toLocaleDateString()}
                      {record.method && ` · ${record.method}`}
                      {record.volume != null && ` · ${record.volume} gal`}
                    </p>
                  </div>
                </div>
                <IrrigationStatusBadge status={record.status} />
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Button
        variant="outline"
        className="min-h-11"
        render={<Link href={`/blocks/${schedule.block.id}`} />}
      >
        View block
      </Button>
    </div>
  );
}
