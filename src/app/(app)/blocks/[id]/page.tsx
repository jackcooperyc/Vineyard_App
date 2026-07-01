import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { getBlockById } from "@/domains/blocks/queries";
import { BlockStatusBadge } from "@/components/blocks/block-status-badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

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
        <Button disabled className="min-h-11">
          Log task (Sprint 2)
        </Button>
        <Button variant="outline" disabled className="min-h-11">
          Add note (Sprint 2)
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
        <CardHeader>
          <CardTitle>Recent tasks</CardTitle>
          <CardDescription>
            {block._count.tasks} total · full module in Sprint 2
          </CardDescription>
        </CardHeader>
        <CardContent>
          {block.tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No tasks yet.</p>
          ) : (
            <ul className="space-y-2">
              {block.tasks.map((task) => (
                <li key={task.id} className="text-sm">
                  {task.title} — {task.status}
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
