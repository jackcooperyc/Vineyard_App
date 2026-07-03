"use client";

/* eslint-disable react-hooks/set-state-in-effect -- GPS data reloads when block selection changes */

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";
import {
  BlockMultiPicker,
  formatTaskBlockLabel,
} from "@/components/shared/block-multi-picker";
import type { BlockPickerItem } from "@/components/shared/block-picker";
import { TaskTypeChips } from "@/components/shared/task-type-chips";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  TaskGpsTracker,
  type GpsActiveSession,
} from "@/components/tasks/task-gps-tracker";
import { fetchGpsFieldData } from "@/domains/task-gps/actions";
import type { TaskTypeConfig } from "@/domains/tasks/types";

type FieldGpsData = Awaited<ReturnType<typeof fetchGpsFieldData>>;

function toActiveSession(
  session: FieldGpsData["activeSession"],
): GpsActiveSession | null {
  if (session?.status !== "ACTIVE" && session?.status !== "PAUSED") {
    return null;
  }
  return {
    id: session.id,
    status: session.status,
    blockId: session.blockId,
    coveragePct: session.coveragePct,
    rowsVisited: session.rowsVisited,
    swathWidthM: session.swathWidthM,
    sessionBlock: session.block,
    task: {
      id: session.task.id,
      title: session.task.title,
      coveragePct: session.task.coveragePct,
      block: session.task.block,
      taskType: session.task.taskType,
      taskBlocks: session.task.taskBlocks?.map((tb) => ({
        blockId: tb.blockId,
        block: tb.block,
        isPrimary: tb.isPrimary,
      })),
    },
  };
}

export function FieldTaskSection({
  blocks,
  quickLogTypes,
  taskTypeId,
  onTaskTypeIdChange,
  onQuickLog,
  quickLogPending,
}: {
  blocks: BlockPickerItem[];
  quickLogTypes: TaskTypeConfig[];
  taskTypeId: string;
  onTaskTypeIdChange: (id: string) => void;
  onQuickLog: (
    typeId: string,
    options?: {
      begin?: boolean;
      blockIds?: string[];
      primaryBlockId?: string;
    },
  ) => void;
  quickLogPending: boolean;
}) {
  const router = useRouter();
  const [gpsData, setGpsData] = useState<FieldGpsData>({
    activeSession: null,
    eligibleTasks: [],
  });
  const [gpsLoading, setGpsLoading] = useState(true);
  const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([]);
  const [primaryBlockId, setPrimaryBlockId] = useState<string | null>(null);

  const activeSession = toActiveSession(gpsData.activeSession);
  const hasGpsTypes = quickLogTypes.some((t) => t.tracksGpsProgress);
  const selectedType = quickLogTypes.find((t) => t.id === taskTypeId);
  const hasBlockSelection = selectedBlockIds.length > 0 && primaryBlockId != null;

  const primaryBlock =
    blocks.find((b) => b.id === primaryBlockId) ?? null;

  const selectionKey = useMemo(
    () => [...selectedBlockIds].sort().join(","),
    [selectedBlockIds],
  );

  async function reloadGps() {
    setGpsLoading(true);
    const data = await fetchGpsFieldData(
      selectedBlockIds.length > 0 ? selectedBlockIds : null,
    );
    setGpsData(data);
    setGpsLoading(false);
    router.refresh();
  }

  useEffect(() => {
    let cancelled = false;
    setGpsLoading(true);
    void fetchGpsFieldData(
      selectedBlockIds.length > 0 ? selectedBlockIds : null,
    ).then((data) => {
      if (cancelled) return;
      setGpsData(data);
      setGpsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [selectionKey, selectedBlockIds]);

  const sessionBlockCode =
    activeSession?.sessionBlock?.code ?? activeSession?.task.block.code;

  const selectedCodes = new Set(
    selectedBlockIds
      .map((id) => blocks.find((b) => b.id === id)?.code)
      .filter(Boolean),
  );
  const sessionBlockMismatch =
    activeSession &&
    sessionBlockCode != null &&
    selectedCodes.size > 0 &&
    !selectedCodes.has(sessionBlockCode);

  const selectionLabel =
    selectedBlockIds.length > 0
      ? formatTaskBlockLabel(
          blocks.filter((b) => selectedBlockIds.includes(b.id)),
          primaryBlock ?? undefined,
        )
      : null;

  return (
    <div className="space-y-6">
      {activeSession && (
        <section className="space-y-2">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Active GPS session
          </h3>
          <TaskGpsTracker
            activeSession={activeSession}
            eligibleTasks={[]}
            onSessionChange={() => void reloadGps()}
          />
        </section>
      )}

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          1 · Select blocks
        </h3>
        <BlockMultiPicker
          blocks={blocks}
          selectedIds={selectedBlockIds}
          primaryId={primaryBlockId}
          onChange={(ids, primary) => {
            setSelectedBlockIds(ids);
            setPrimaryBlockId(primary);
          }}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          2 · Quick log
        </h3>
        <div className="space-y-2">
          <Label>Task type</Label>
          <TaskTypeChips
            types={quickLogTypes}
            value={taskTypeId}
            onChange={onTaskTypeIdChange}
            disabled={quickLogPending || !hasBlockSelection}
          />
        </div>
        {selectedType?.tracksGpsProgress && hasBlockSelection ? (
          <div className="grid grid-cols-2 gap-2">
            <Button
              type="button"
              size="touch"
              variant="outline"
              disabled={quickLogPending}
              onClick={() =>
                onQuickLog(taskTypeId, {
                  begin: false,
                  blockIds: selectedBlockIds,
                  primaryBlockId: primaryBlockId!,
                })
              }
            >
              Log only
            </Button>
            <Button
              type="button"
              size="touch"
              disabled={quickLogPending}
              onClick={() =>
                onQuickLog(taskTypeId, {
                  begin: true,
                  blockIds: selectedBlockIds,
                  primaryBlockId: primaryBlockId!,
                })
              }
            >
              Log & begin
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            size="touch"
            className="w-full"
            disabled={quickLogPending || !hasBlockSelection || !taskTypeId}
            onClick={() =>
              onQuickLog(taskTypeId, {
                blockIds: selectedBlockIds,
                primaryBlockId: primaryBlockId ?? undefined,
              })
            }
          >
            {quickLogPending ? "Saving…" : "Log task"}
          </Button>
        )}
        <p className="text-sm text-muted-foreground">
          For spraying, weeding, or mowing in progress, use Log & begin to start
          GPS tracking on the primary block
          {primaryBlock ? ` (${primaryBlock.code})` : ""}.
        </p>
      </section>

      {hasGpsTypes && (
        <section className="space-y-3 border-t pt-6">
          <div className="flex items-center gap-2">
            <MapPin className="size-4 text-primary" />
            <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              3 · GPS track
            </h3>
          </div>
          <p className="text-sm text-muted-foreground">
            Record your path and block coverage while work is in progress.
            Eligible tasks match any selected block.
          </p>

          {!hasBlockSelection ? (
            <p className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              Select at least one block above to see GPS-eligible tasks.
            </p>
          ) : gpsLoading ? (
            <p className="text-sm text-muted-foreground">Loading tasks…</p>
          ) : activeSession ? (
            <p className="text-sm text-muted-foreground">
              End your active session above before starting tracking on another
              task.
              {sessionBlockMismatch &&
                " Your session is on a different block than selected."}
            </p>
          ) : gpsData.eligibleTasks.length === 0 ? (
            <div className="space-y-2 rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              <p>
                No open GPS-eligible tasks for{" "}
                <span className="font-medium text-foreground">
                  {selectionLabel ?? "selected blocks"}
                </span>
                .
              </p>
              <p>
                Quick-log a spraying, weeding, or mowing task first, or{" "}
                <Link
                  href={`/tasks/new${primaryBlockId ? `?blockId=${primaryBlockId}` : ""}`}
                  className="text-primary underline-offset-4 hover:underline"
                >
                  create a full task
                </Link>
                .
              </p>
            </div>
          ) : (
            <TaskGpsTracker
              activeSession={null}
              eligibleTasks={gpsData.eligibleTasks}
              filterBlockId={primaryBlockId ?? undefined}
              onSessionChange={() => void reloadGps()}
            />
          )}
        </section>
      )}
    </div>
  );
}

export function formatEligibleTaskBlocks(
  task: {
    block: { code: string };
    taskBlocks?: { block: { code: string } }[];
  },
): string {
  const taskBlocks = task.taskBlocks?.map((tb) => tb.block) ?? [task.block];
  return formatTaskBlockLabel(taskBlocks);
}
