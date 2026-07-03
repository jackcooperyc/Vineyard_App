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
import { getActiveFieldSessions } from "@/domains/task-gps/queries";

function formatPct(value: number | null): string {
  if (value == null) return "—";
  return `${Math.round(value)}%`;
}

export async function ActiveGpsSessionsCard() {
  const sessions = await getActiveFieldSessions(5);

  if (sessions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-4">
        <div>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="size-5" />
            Active GPS sessions
          </CardTitle>
          <CardDescription>Workers currently tracking field coverage</CardDescription>
        </div>
        <Link href="/field" className="text-sm text-primary hover:underline">
          Field log →
        </Link>
      </CardHeader>
      <CardContent className="space-y-3">
        {sessions.map((session) => (
          <Link
            key={session.id}
            href={`/tasks/${session.task.id}`}
            className="flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/40"
          >
            <div className="min-w-0 space-y-1">
              <p className="truncate font-medium">{session.task.title}</p>
              <p className="text-xs text-muted-foreground">
                {session.user.name ?? "Worker"} · {session.task.block.code} ·{" "}
                {session.task.taskType.label}
              </p>
            </div>
            <Badge variant="secondary" className="shrink-0 tabular-nums">
              {formatPct(session.task.coveragePct)}
            </Badge>
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
