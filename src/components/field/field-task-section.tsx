"use client";

/* eslint-disable react-hooks/set-state-in-effect -- GPS data reloads when block selection changes */

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { BlockPicker, type BlockPickerItem } from "@/components/shared/block-picker";
import { TaskTypeChips } from "@/components/shared/task-type-chips";
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
  if (session?.status === "ACTIVE" || session?.status === "PAUSED") {
    return session as GpsActiveSession;
  }
  return null;
}

export function FieldTaskSection({
  blocks,
  quickLogTypes,
  blockId,
  onBlockIdChange,
  taskTypeId,
  onTaskTypeIdChange,
  onQuickLog,
  quickLogPending,
}: {
  blocks: BlockPickerItem[];
  quickLogTypes: TaskTypeConfig[];
  blockId: string | null;
  onBlockIdChange: (id: string | null) => void;
  taskTypeId: string;
  onTaskTypeIdChange: (id: string) => void;
  onQuickLog: (typeId: string) => void;
  quickLogPending: boolean;
}) {
  const router = useRouter();
  const [gpsData, setGpsData] = useState<FieldGpsData>({
    activeSession: null,
    eligibleTasks: [],
  });
  const [gpsLoading, setGpsLoading] = useState(true);

  const selectedBlock = blocks.find((b) => b.id === blockId) ?? null;
  const activeSession = toActiveSession(gpsData.activeSession);
  const hasGpsTypes = quickLogTypes.some((t) => t.tracksGpsProgress);

  async function reloadGps() {
    setGpsLoading(true);
    const data = await fetchGpsFieldData(blockId);
    setGpsData(data);
    setGpsLoading(false);
    router.refresh();
  }

  useEffect(() => {
    let cancelled = false;
    setGpsLoading(true);
    void fetchGpsFieldData(blockId).then((data) => {
      if (cancelled) return;
      setGpsData(data);
      setGpsLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [blockId]);

  function handleBlockChange(id: string) {
    onBlockIdChange(id);
  }

  function handleQuickLog(typeId: string) {
    onQuickLog(typeId);
  }

  const sessionBlockMismatch =
    activeSession &&
    blockId &&
    activeSession.task.block.code !==
      blocks.find((b) => b.id === blockId)?.code;

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
          1 · Select block
        </h3>
        <BlockPicker
          blocks={blocks}
          value={blockId}
          onChange={handleBlockChange}
        />
      </section>

      <section className="space-y-3">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          2 · Quick log
        </h3>
        <TaskTypeChips
          types={quickLogTypes}
          value={taskTypeId}
          onChange={onTaskTypeIdChange}
          onSelect={handleQuickLog}
          disabled={quickLogPending || !blockId}
        />
        <p className="text-sm text-muted-foreground">
          Tap a task type to log a completed task instantly. For spraying,
          weeding, or mowing in progress, use GPS tracking below.
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
            Requires an open task on the selected block.
          </p>

          {!blockId ? (
            <p className="rounded-lg border border-dashed bg-muted/30 px-4 py-3 text-sm text-muted-foreground">
              Select a block above to see GPS-eligible tasks.
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
                  {selectedBlock?.code ?? "this block"}
                </span>
                .
              </p>
              <p>
                Quick-log a spraying, weeding, or mowing task first, or{" "}
                <Link
                  href={`/tasks/new${blockId ? `?blockId=${blockId}` : ""}`}
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
              onSessionChange={() => void reloadGps()}
            />
          )}
        </section>
      )}
    </div>
  );
}
