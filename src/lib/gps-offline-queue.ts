/**
 * Offline GPS point queue — deferred to v2.
 *
 * v1 records GPS only while online. When implemented, this module will:
 * - Persist batched points to IndexedDB when offline
 * - Replay via appendTaskGpsPoints on reconnect
 * - Expose queue depth for field UI status
 */

export type QueuedGpsPoint = {
  sessionId: string;
  lat: number;
  lng: number;
  accuracyM?: number;
  recordedAt: string;
};

export async function enqueueOfflinePoint(point: QueuedGpsPoint): Promise<void> {
  void point;
  // v2 stub — no-op in online-only v1
}

export async function flushOfflineQueue(): Promise<number> {
  return 0;
}

export async function getOfflineQueueSize(): Promise<number> {
  return 0;
}
