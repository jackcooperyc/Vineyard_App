import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin, Pencil } from "lucide-react";
import { getBlockById, getOpenTaskEquipmentForBlock } from "@/domains/blocks/queries";
import { BlockStatusBadge } from "@/components/blocks/block-status-badge";
import { BlockTerrainSection } from "@/components/blocks/block-terrain-section";
import { BlockNoteForm } from "@/components/blocks/block-note-form";
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
import { getQuickLogTaskTypes } from "@/domains/tasks/type-queries";
import { getBlocksForTaskForm } from "@/domains/tasks/queries";
import type { TaskListItem } from "@/domains/tasks/queries";
import { BlockRowLayoutPanel } from "@/components/blocks/block-row-layout-panel";
import { getBlockRowLayoutStatus } from "@/domains/block-rows/actions";
import {
  VarietyColorRow,
  WineTypeBadge,
} from "@/components/varieties/variety-color-row";
import { auth } from "@/lib/auth";
import { hasPermission } from "@/lib/auth-session";
import { parseUserRole } from "@/lib/rbac";

export default async function BlockDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  const role = parseUserRole(session?.user?.role);
  const canEditBlock = hasPermission(role, "blocks:edit");
  const canAddNote = hasPermission(role, "notes:create");

  const [block, equipment, blockEquipment, quickLogTypes, rowLayoutStatus, vineyardBlocks] =
    await Promise.all([
    getBlockById(id),
    getActiveEquipmentForSelect(),
    getOpenTaskEquipmentForBlock(id),
    getQuickLogTaskTypes(),
    getBlockRowLayoutStatus(id),
    getBlocksForTaskForm(),
  ]);

  if (!block) {
    notFound();
  }

  const totalVines = block.plantings.reduce(
    (sum, p) => sum + (p.vineCount ?? 0),
    0,
  );

  const taskItems: TaskListItem[] = block.tasks.map((task) => ({
    id: task.id,
    title: task.title,
    taskType: task.taskType,
    status: task.status,
    dueDate: task.dueDate,
    completedAt: task.completedAt,
    coveragePct: task.coveragePct ?? null,
    rowsCompleted: task.rowsCompleted ?? null,
    rowsTotal: task.rowsTotal ?? null,
    block: { id: block.id, code: block.code, name: block.name },
    assignedTo: task.assignedTo,
  }));

  const primaryPlanting = block.plantings[0];

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
            {block.blockType === "INFRASTRUCTURE" && block.infrastructureType &&
              ` · ${block.infrastructureType}`}
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
          blocks={vineyardBlocks}
          quickLogTypes={quickLogTypes}
          equipment={equipment}
        />
        <QuickLogIrrigationSheet
          blockId={block.id}
          blockCode={block.code}
          blockName={block.name}
        />
        {canEditBlock && (
          <Button
            variant="outline"
            className="min-h-11 gap-2"
            render={<Link href={`/blocks/${block.id}/edit`} />}
          >
            <Pencil className="size-4" />
            Edit block
          </Button>
        )}
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
            render={<Link href={`/map?block=${block.id}`} />}
          >
            <MapPin className="size-4" />
            View on map
          </Button>
        )}
      </div>

      <BlockTerrainSection
        block={{
          blockType: block.blockType,
          infrastructureType: block.infrastructureType,
          acreage: block.acreage,
          areaSqm: block.areaSqm,
          perimeterM: block.perimeterM,
          elevMin: block.elevMin,
          elevMed: block.elevMed,
          elevMax: block.elevMax,
          growthStage: block.growthStage,
          colorHex: block.colorHex,
        }}
        viticultureMetrics={block.viticultureMetrics}
      />

      {block.blockType === "VINEYARD" && (
        <Card>
          <CardHeader>
            <CardTitle>Row layout</CardTitle>
            <CardDescription>
              Row spacing and GIS row data for GPS row progress
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BlockRowLayoutPanel
              blockId={block.id}
              initialStatus={rowLayoutStatus}
              initialRowSpacing={primaryPlanting?.rowSpacing ?? null}
              initialVineSpacing={primaryPlanting?.vineSpacing ?? null}
            />
          </CardContent>
        </Card>
      )}

      {block.blockType === "VINEYARD" && (
      <Card>
        <CardHeader>
          <CardTitle>Plantings</CardTitle>
          <CardDescription>Varietals and vine counts for this block</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {block.plantings.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {canEditBlock
                ? "No plantings recorded. Edit block to add variety plantings."
                : "No plantings recorded. Ask a manager to update block data."}
            </p>
          ) : (
          block.plantings.map((planting) => (
            <div key={planting.id} className="space-y-3 border-b pb-4 last:border-0 last:pb-0">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    {planting.variety.colorHex && (
                      <span
                        className="size-3.5 shrink-0 rounded-sm ring-1 ring-black/20"
                        style={{ backgroundColor: planting.variety.colorHex }}
                        aria-hidden
                      />
                    )}
                    <p className="font-medium">{planting.variety.name}</p>
                    <WineTypeBadge color={planting.variety.color} />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {planting.yearPlanted != null
                      ? `Planted ${planting.yearPlanted}`
                      : "Year planted not recorded"}
                    {planting.rootstock && ` · ${planting.rootstock}`}
                  </p>
                </div>
                <p className="text-sm font-medium">
                  {planting.vineCount != null
                    ? `${planting.vineCount.toLocaleString()} vines`
                    : "Vine count not recorded"}
                </p>
              </div>
              <VarietyColorRow
                variety={{
                  id: planting.variety.id,
                  name: planting.variety.name,
                  color: planting.variety.color,
                  colorHex: planting.variety.colorHex,
                }}
                compact
                hideHeader
                showPlantingCount={false}
              />
            </div>
          ))
          )}
        </CardContent>
      </Card>
      )}

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
          {canAddNote && (
            <BlockNoteForm
              blockId={block.id}
              blockLabel={`${block.code} · ${block.name}`}
            />
          )}
          {block.notes_records.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              {canAddNote
                ? "No notes yet. Log the first observation above."
                : "No notes yet."}
            </p>
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
            render={
              <Link href={`/irrigation?view=records&blockId=${block.id}`} />
            }
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
                  <Link
                    key={schedule.id}
                    href={`/irrigation/schedules/${schedule.id}`}
                    className="block text-sm hover:text-primary"
                  >
                    <span className="font-medium">{freq}</span>
                    {schedule.method && ` · ${schedule.method}`}
                    {schedule.volume != null && ` · ${schedule.volume} gal`}
                  </Link>
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
              <Link
                key={record.id}
                href={`/irrigation/records/${record.id}`}
                className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 last:border-0 hover:bg-muted/50 -mx-2 px-2 rounded-lg transition-colors"
              >
                <div>
                  <p className="text-sm font-medium">
                    {record.appliedAt.toLocaleDateString()}
                    {record.method && ` · ${record.method}`}
                    {record.volume != null && ` · ${record.volume} gal`}
                  </p>
                </div>
                <IrrigationStatusBadge status={record.status} />
              </Link>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4">
          <div>
            <CardTitle>Equipment</CardTitle>
            <CardDescription>
              Assets linked to open tasks on this block
            </CardDescription>
          </div>
          {blockEquipment.length > 0 && (
            <Button
              variant="link"
              className="h-auto p-0"
              render={<Link href="/equipment" />}
            >
              View all
            </Button>
          )}
        </CardHeader>
        <CardContent className="space-y-3">
          {blockEquipment.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No equipment assigned to open tasks on this block.
            </p>
          ) : (
            blockEquipment.map((item) => (
              <Link
                key={item.id}
                href={`/equipment/${item.id}`}
                className="block rounded-lg border bg-muted/20 p-3 text-sm transition-colors hover:bg-muted/40"
              >
                <p className="font-medium">{item.name}</p>
                <p className="text-muted-foreground">{item.type}</p>
              </Link>
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
          {block._count.tasks > 0 && (
            <Button
              variant="link"
              className="h-auto p-0"
              render={<Link href={`/tasks?blockId=${block.id}`} />}
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
