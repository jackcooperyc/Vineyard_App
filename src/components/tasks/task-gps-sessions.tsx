import Link from "next/link";
import { MapPin } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getTaskGpsSessions } from "@/domains/task-gps/queries";

function formatPct(value: number | null): string {
  if (value == null) return "—";
  return `${Math.round(value)}%`;
}

function statusLabel(status: string): string {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "PAUSED":
      return "Paused";
    case "COMPLETED":
      return "Completed";
    case "CANCELLED":
      return "Cancelled";
    default:
      return status;
  }
}

export async function TaskGpsSessions({
  taskId,
  blockId,
}: {
  taskId: string;
  blockId?: string;
}) {
  const sessions = await getTaskGpsSessions(taskId);

  if (sessions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="size-5" />
          GPS sessions
        </CardTitle>
        <CardDescription>
          Field coverage tracked from mobile GPS paths
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.map((session) => (
          <div
            key={session.id}
            className="flex flex-wrap items-center justify-between gap-2 border-b pb-3 last:border-0"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {statusLabel(session.status)}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  {session.user.name ?? session.user.email}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">
                {session.startedAt.toLocaleString()}
                {session.endedAt && ` → ${session.endedAt.toLocaleString()}`}
                {session.pointCount > 0 && ` · ${session.pointCount} points`}
              </p>
            </div>
            <div className="text-right">
              <p className="font-semibold tabular-nums">
                {formatPct(session.coveragePct)}
              </p>
              {session.rowsVisited != null && (
                <p className="text-xs text-muted-foreground">
                  {session.rowsVisited} rows
                </p>
              )}
            </div>
          </div>
        ))}
        <Link
          href={blockId ? `/map?block=${blockId}` : "/map"}
          className="inline-block text-sm text-primary underline-offset-4 hover:underline"
        >
          View track on map →
        </Link>
        <Link
          href="/field"
          className="ml-4 inline-block text-sm text-primary underline-offset-4 hover:underline"
        >
          Continue tracking in Field log →
        </Link>
      </CardContent>
    </Card>
  );
}
