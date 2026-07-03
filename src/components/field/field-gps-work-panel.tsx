"use client";

/* eslint-disable react-hooks/set-state-in-effect -- field GPS data loads when block selection changes */

import { useEffect, useState } from "react";
import { TaskGpsTracker, type GpsActiveSession } from "@/components/tasks/task-gps-tracker";
import { fetchGpsFieldData } from "@/domains/task-gps/actions";

type FieldGpsData = Awaited<ReturnType<typeof fetchGpsFieldData>>;

function toActiveSession(
  session: FieldGpsData["activeSession"],
): GpsActiveSession | null {
  if (session?.status === "ACTIVE" || session?.status === "PAUSED") {
    return session as GpsActiveSession;
  }
  return null;
}

export function FieldGpsWorkPanel({ blockId }: { blockId: string | null }) {
  const [activeSession, setActiveSession] = useState<
    FieldGpsData["activeSession"]
  >(null);
  const [eligibleTasks, setEligibleTasks] = useState<
    FieldGpsData["eligibleTasks"]
  >([]);
  const [loading, setLoading] = useState(Boolean(blockId));

  useEffect(() => {
    if (!blockId) {
      setActiveSession(null);
      setEligibleTasks([]);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);

    void fetchGpsFieldData(blockId).then((data) => {
      if (cancelled) return;
      setActiveSession(data.activeSession);
      setEligibleTasks(data.eligibleTasks);
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [blockId]);

  async function reload() {
    if (!blockId) return;
    const data = await fetchGpsFieldData(blockId);
    setActiveSession(data.activeSession);
    setEligibleTasks(data.eligibleTasks);
  }

  if (!blockId) {
    return (
      <p className="text-sm text-muted-foreground">
        Select a block to start or continue GPS work.
      </p>
    );
  }

  if (loading) {
    return (
      <p className="text-sm text-muted-foreground">Loading GPS tasks…</p>
    );
  }

  return (
    <TaskGpsTracker
      activeSession={toActiveSession(activeSession)}
      eligibleTasks={eligibleTasks}
      onSessionChange={() => void reload()}
    />
  );
}
