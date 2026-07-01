import Link from "next/link";
import { AlertTriangle, CalendarClock, ClipboardPen, Droplets, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyContext = {
  view: "schedules" | "records" | "alerts";
  hasFilters: boolean;
  blockId?: string;
  blockCode?: string;
};

export function IrrigationEmptyState({ context }: { context: EmptyContext }) {
  const newScheduleHref = context.blockId
    ? `/irrigation/schedules/new?blockId=${context.blockId}`
    : "/irrigation/schedules/new";
  const newRecordHref = context.blockId
    ? `/irrigation/records/new?blockId=${context.blockId}`
    : "/irrigation/records/new";

  if (context.hasFilters) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
        <RotateCcw className="mx-auto mb-3 size-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No results match</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {context.blockCode
            ? `Nothing for block ${context.blockCode} with the current filters.`
            : "Try adjusting your filters."}
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            className="min-h-11 gap-2"
            render={<Link href="/irrigation" />}
          >
            <RotateCcw className="size-4" />
            Clear filters
          </Button>
          {context.view === "schedules" && (
            <Button className="min-h-11 gap-2" render={<Link href={newScheduleHref} />}>
              <Plus className="size-4" />
              New schedule
            </Button>
          )}
          {context.view === "records" && (
            <Button className="min-h-11 gap-2" render={<Link href={newRecordHref} />}>
              <Droplets className="size-4" />
              Log irrigation
            </Button>
          )}
        </div>
      </div>
    );
  }

  if (context.view === "alerts") {
    return (
      <div className="rounded-xl border border-dashed bg-emerald-50/50 px-6 py-10 text-center dark:bg-emerald-950/20">
        <AlertTriangle className="mx-auto mb-3 size-10 text-emerald-600" />
        <h3 className="text-lg font-semibold">All schedules up to date</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          No overdue irrigation — active schedules are on track.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            className="min-h-11 gap-2"
            render={<Link href="/irrigation?view=schedules" />}
          >
            <CalendarClock className="size-4" />
            View schedules
          </Button>
          <Button className="min-h-11 gap-2" render={<Link href={newRecordHref} />}>
            <Droplets className="size-4" />
            Log irrigation
          </Button>
        </div>
      </div>
    );
  }

  if (context.view === "records") {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
        <Droplets className="mx-auto mb-3 size-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No irrigation records</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Log applied irrigation from the field or create a detailed record.
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button className="min-h-11 gap-2" render={<Link href={newRecordHref} />}>
            <Droplets className="size-4" />
            Log irrigation
          </Button>
          <Button
            variant="outline"
            className="min-h-11 gap-2"
            render={<Link href="/field" />}
          >
            <ClipboardPen className="size-4" />
            Field log
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
      <CalendarClock className="mx-auto mb-3 size-10 text-muted-foreground" />
      <h3 className="text-lg font-semibold">No irrigation schedules</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Set up recurring schedules by block to track due dates and alerts.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button className="min-h-11 gap-2" render={<Link href={newScheduleHref} />}>
          <Plus className="size-4" />
          New schedule
        </Button>
        <Button
          variant="outline"
          className="min-h-11 gap-2"
          render={<Link href="/field" />}
        >
          <ClipboardPen className="size-4" />
          Field log
        </Button>
      </div>
    </div>
  );
}
