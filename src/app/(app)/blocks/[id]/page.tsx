import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { getBlockById } from "@/domains/blocks/queries";
import { BlockStatusBadge } from "@/components/blocks/block-status-badge";
import { QuickLogTaskSheet } from "@/components/tasks/quick-log-task-sheet";
import { TaskListCard } from "@/components/tasks/task-list-card";
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
  const block = await getBlockById(id);

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
