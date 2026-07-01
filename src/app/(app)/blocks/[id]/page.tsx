import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { getBlockById } from "@/domains/blocks/queries";
import { BlockStatusBadge } from "@/components/blocks/block-status-badge";
import { QuickLogTaskSheet } from "@/components/tasks/quick-log-task-sheet";
import { QuickLogIrrigationSheet } from "@/components/irrigation/quick-log-irrigation-sheet";
import { IrrigationStatusBadge } from "@/components/irrigation/irrigation-status-badge";
import { IRRIGATION_FREQUENCIES } from "@/domains/irrigation/constants";
import { TaskListCard } from "@/components/tasks/task-list-card";
import { getActiveEquipmentForSelect } from "@/domains/equipment/queries";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { TaskListItem } from "@/domains/tasks/queries";

export default async function BlockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [block, equipment] = await Promise.all([
    getBlockById(id),
    getActiveEquipmentForSelect(),
  ]);

  if (!block) {
    notFound();
  }

  const totalVines = block.plantings.reduce((sum, p) => sum + p.vineCount, 0);

  const taskItems: TaskListItem[] = block.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    type: task.type,
    status: task.status,
    dueDate: task.dueDate,
    completedAt: task.completedAt,
    block: { id: block.id, code: block.code, name: block.name },
    assignedTo: task.assignedTo,
  }));

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          render={<Link href="/blocks" aria-label="Back to blocks" />}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">
              {block.code}
            </span>
            <BlockStatusBadge status={block.status} />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">{block.name}</h2>
          <p className="text-sm text-muted-foreground">
            {block.vineyard.name}
            {block.acreage != null && ` · ${block.acreage} acres`}
            {totalVines > 0 && ` · ${totalVines.toLocaleString()} vines`}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <QuickLogTaskSheet
          blockId={block.id}
          blockCode={block.code}
          blockName={block.name}
          equipment={equipment}
        />
        <QuickLogIrrigationSheet
          blockId={block.id}
          blockCode={block.code}
          blockName={block.name}
        />
        <Button
          variant="outline"
          className="min-h-11"
          render={<Link href={`/tasks/new?blockId=${block.id}`} />}
        >
          Full task form
        </Button>
        {block.mapFeature && (
          <Button
            variant="outline"
            className="min-h-11"
            render={<Link href="/map" />}
          >
            <MapPin className="size-4" />
            View on map
          </Button>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Plantings</CardTitle>
          <CardDescription>Varietals and vine counts for this block</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {block.plantings.map((planting) => (
            <div
              key={planting.id}
              className="flex flex-wrap items-baseline justify-between gap-2 border-b pb-4 last:border-0 last:pb-0"
            >
              <div>
                <p className="font-medium">{planting.variety.name}</p>
                <p className="text-sm text-muted-foreground">
                  Planted {planting.yearPlanted}
                  {planting.rootstock && ` · ${planting.rootstock}`}
                </p>
              </div>
              <p className="text-sm font-medium">
                {planting.vineCount.toLocaleString()} vines
              </p>
            </div>
          ))}
        </CardContent>
      </Card>

      {block.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Block notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{block.notes}</p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Field notes</CardTitle>
          <CardDescription>Observations logged against this block</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {block.notes_records.length === 0 ? (
            <p className="text-sm text-muted-foreground">No notes yet.</p>
          ) : (
            block.notes_records.map((note) => (
              <div key={note.id} className="space-y-1 border-b pb-4 last:border-0">
                <p className="text-sm">{note.content}</p>
                <p className="text-xs text-muted-foreground">
                  {note.author.name ?? note.author.email} ·{" "}
                  {note.createdAt.toLocaleDateString()}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Irrigation</CardTitle>
            <CardDescription>
              {block._count.irrigationRecords} record
              {block._count.irrigationRecords !== 1 ? "s" : ""}
              {block.irrigationSchedules.length > 0 &&
                ` · ${block.irrigationSchedules.length} active schedule${block.irrigationSchedules.length !== 1 ? "s" : ""}`}
            </CardDescription>
          </div>
          <Button
            variant="link"
            className="h-auto p-0"
            render={<Link href={`/irrigation?view=records`} />}
          >
            View all
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          {block.irrigationSchedules.length > 0 && (
            <div className="space-y-2 border-b pb-4">
              {block.irrigationSchedules.map((schedule) => {
                const freq =
                  IRRIGATION_FREQUENCIES.find((f) => f.value === schedule.frequency)
                    ?.label ?? schedule.frequency;
                return (
                  <p key={schedule.id} className="text-sm">
                    <span className="font-medium">{freq}</span>
                    {schedule.method && ` · ${schedule.method}`}
                    {schedule.volume != null && ` · ${schedule.volume} gal`}
                  </p>
                );
              })}
            </div>
          )}
          {block.irrigationRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No irrigation logged yet. Use Log irrigation above.
            </p>
          ) : (
            block.irrigationRecords.map((record) => (
              <div
                key={record.id}
                className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 last:border-0"
              >
                <div>
                  <p className="text-sm font-medium">
                    {record.appliedAt.toLocaleDateString()}
                    {record.method && ` · ${record.method}`}
                    {record.volume != null && ` · ${record.volume} gal`}
                  </p>
                </div>
                <IrrigationStatusBadge status={record.status} />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Tasks</CardTitle>
            <CardDescription>
              {block._count.tasks} total for this block
            </CardDescription>
          </div>
          {block._count.tasks > 5 && (
            <Button
              variant="link"
              className="h-auto p-0"
              render={<Link href={`/tasks?status=ALL`} />}
            >
              View all
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {taskItems.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No tasks yet. Use Log task above to get started.
            </p>
          ) : (
            taskItems.map((task) => <TaskListCard key={task.id} task={task} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}
