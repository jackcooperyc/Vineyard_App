"use client";

/* eslint-disable react-hooks/set-state-in-effect -- geolocation watch lifecycle tied to session status */

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { MapPin, Pause, Play, Square, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  appendTaskGpsPoints,
  cancelGpsSession,
  endGpsSession,
  pauseGpsSession,
  resumeGpsSession,
  startGpsSession,
} from "@/domains/task-gps/actions";
import { GPS_MIN_MOVE_M } from "@/domains/task-gps/constants";

type GpsActiveSession = {
  id: string;
  status: "ACTIVE" | "PAUSED";
  coveragePct: number | null;
  rowsVisited: number | null;
  swathWidthM: number | null;
  task: {
    id: string;
    title: string;
    coveragePct: number | null;
    block: { code: string; name: string };
    taskType: { label: string };
  };
};

export type { GpsActiveSession };

type GpsTask = {
  id: string;
  title: string;
  coveragePct: number | null;
  rowsCompleted: number | null;
  rowsTotal: number | null;
  taskType: { label: string; defaultSwathWidthM: number | null };
};

function formatPct(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${Math.round(value)}%`;
}

export function TaskGpsTracker({
  activeSession,
  eligibleTasks,
  onSessionChange,
}: {
  activeSession: GpsActiveSession | null;
  eligibleTasks: GpsTask[];
  onSessionChange?: () => void;
}) {
  const router = useRouter();
  const watchIdRef = useRef<number | null>(null);
  const pendingPointsRef = useRef<
    {
      lat: number;
      lng: number;
      accuracyM?: number;
      speedMps?: number;
      heading?: number;
      recordedAt: string;
    }[]
  >([]);
  const lastPointRef = useRef<{ lat: number; lng: number } | null>(null);
  const flushTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const sessionIdRef = useRef<string | null>(activeSession?.id ?? null);

  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [liveCoverage, setLiveCoverage] = useState<number | null>(
    activeSession?.coveragePct ?? activeSession?.task.coveragePct ?? null,
  );

  useEffect(() => {
    sessionIdRef.current = activeSession?.id ?? null;
  }, [activeSession?.id]);

  const flushPoints = useCallback(async () => {
    const sessionId = sessionIdRef.current;
    const batch = pendingPointsRef.current.splice(0);
    if (!sessionId || batch.length === 0) return;

    const result = await appendTaskGpsPoints({ sessionId, points: batch });
    if (result.error) {
      pendingPointsRef.current.unshift(...batch);
      setError(result.error);
      return;
    }
    if (result.coveragePct != null) {
      setLiveCoverage(result.coveragePct);
    }
    router.refresh();
    onSessionChange?.();
  }, [router, onSessionChange]);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current != null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
    if (flushTimerRef.current) {
      clearInterval(flushTimerRef.current);
      flushTimerRef.current = null;
    }
  }, []);

  const startWatching = useCallback(() => {
    if (!navigator.geolocation) {
      setError("Geolocation is not available in this browser.");
      return;
    }

    stopWatching();
    flushTimerRef.current = setInterval(() => {
      void flushPoints();
    }, 10000);

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const sessionId = sessionIdRef.current;
        if (!sessionId) return;

        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const last = lastPointRef.current;
        if (last) {
          const dLat = ((lat - last.lat) * Math.PI) / 180;
          const dLng = ((lng - last.lng) * Math.PI) / 180;
          const a =
            Math.sin(dLat / 2) ** 2 +
            Math.cos((last.lat * Math.PI) / 180) *
              Math.cos((lat * Math.PI) / 180) *
              Math.sin(dLng / 2) ** 2;
          const distM = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          if (distM < GPS_MIN_MOVE_M) return;
        }

        lastPointRef.current = { lat, lng };
        pendingPointsRef.current.push({
          lat,
          lng,
          accuracyM: pos.coords.accuracy,
          speedMps: pos.coords.speed ?? undefined,
          heading: pos.coords.heading ?? undefined,
          recordedAt: new Date(pos.timestamp).toISOString(),
        });
      },
      (err) => setError(err.message),
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 15000 },
    );
  }, [flushPoints, stopWatching]);

  useEffect(() => {
    if (activeSession?.status === "ACTIVE") {
      startWatching();
    } else {
      stopWatching();
    }
    return stopWatching;
  }, [activeSession?.id, activeSession?.status, startWatching, stopWatching]);

  async function handleStart(taskId: string, swathWidthM?: number) {
    setError(null);
    setBusy(true);
    const result = await startGpsSession({ taskId, swathWidthM });
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    router.refresh();
    onSessionChange?.();
  }

  async function handlePause() {
    if (!activeSession) return;
    setBusy(true);
    await flushPoints();
    const result = await pauseGpsSession(activeSession.id);
    setBusy(false);
    if (result.error) setError(result.error);
    else router.refresh();
  }

  async function handleResume() {
    if (!activeSession) return;
    setBusy(true);
    const result = await resumeGpsSession(activeSession.id);
    setBusy(false);
    if (result.error) setError(result.error);
    else router.refresh();
  }

  async function handleEnd() {
    if (!activeSession) return;
    setBusy(true);
    await flushPoints();
    const result = await endGpsSession(activeSession.id);
    setBusy(false);
    if (result.error) setError(result.error);
    else {
      router.refresh();
      onSessionChange?.();
    }
  }

  async function handleCancel() {
    if (!activeSession) return;
    setBusy(true);
    stopWatching();
    const result = await cancelGpsSession(activeSession.id);
    setBusy(false);
    if (result.error) setError(result.error);
    else router.refresh();
  }

  if (activeSession) {
    const rowsLabel =
      activeSession.rowsVisited != null
        ? `${activeSession.rowsVisited} rows`
        : null;

    return (
      <div className="space-y-4 rounded-xl border border-primary/30 bg-primary/5 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <MapPin className="size-4 text-primary" />
              <span className="text-sm font-semibold">GPS session active</span>
              <Badge variant="outline" className="text-xs">
                {activeSession.status === "PAUSED" ? "Paused" : "Recording"}
              </Badge>
            </div>
            <p className="text-sm font-medium">{activeSession.task.title}</p>
            <p className="text-xs text-muted-foreground">
              {activeSession.task.block.code} · {activeSession.task.taskType.label}
            </p>
          </div>
          <p className="text-2xl font-bold tabular-nums text-primary">
            {formatPct(liveCoverage)}
          </p>
        </div>

        {rowsLabel && (
          <p className="text-sm text-muted-foreground">{rowsLabel} visited</p>
        )}

        <div className="grid grid-cols-2 gap-2">
          {activeSession.status === "ACTIVE" ? (
            <Button
              variant="outline"
              className="min-h-11"
              disabled={busy}
              onClick={() => void handlePause()}
            >
              <Pause className="size-4" />
              Pause
            </Button>
          ) : (
            <Button
              variant="outline"
              className="min-h-11"
              disabled={busy}
              onClick={() => void handleResume()}
            >
              <Play className="size-4" />
              Resume
            </Button>
          )}
          <Button
            className="min-h-11"
            disabled={busy}
            onClick={() => void handleEnd()}
          >
            <Square className="size-4" />
            End session
          </Button>
        </div>

        <Button
          variant="ghost"
          size="sm"
          className="w-full text-muted-foreground"
          disabled={busy}
          onClick={() => void handleCancel()}
        >
          <X className="size-4" />
          Cancel without saving progress
        </Button>

        {error && (
          <p className="text-sm text-destructive" role="alert">
            {error}
          </p>
        )}
      </div>
    );
  }

  if (eligibleTasks.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No open GPS-eligible tasks for this block. Create a spraying, weeding, or mowing task first.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Select a task to start GPS tracking. Coverage is calculated from your path and swath width.
      </p>
      {eligibleTasks.map((task) => (
        <button
          key={task.id}
          type="button"
          disabled={busy}
          onClick={() =>
            void handleStart(
              task.id,
              task.taskType.defaultSwathWidthM ?? undefined,
            )
          }
          className="field-tap flex w-full items-center justify-between gap-3 rounded-xl border bg-card px-4 py-3 text-left touch-manipulation hover:bg-muted/40 disabled:opacity-50"
        >
          <div>
            <p className="font-medium">{task.title}</p>
            <p className="text-xs text-muted-foreground">{task.taskType.label}</p>
          </div>
          <div className="text-right">
            <p className="text-sm font-semibold tabular-nums text-primary">
              {formatPct(task.coveragePct)}
            </p>
            {task.rowsTotal != null && task.rowsTotal > 0 && (
              <p className="text-xs text-muted-foreground">
                {task.rowsCompleted ?? 0}/{task.rowsTotal} rows
              </p>
            )}
          </div>
        </button>
      ))}
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
