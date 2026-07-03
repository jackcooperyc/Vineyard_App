import { Trash2 } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RestoreRecordButton } from "@/components/soft-delete/restore-record-button";
import { formatDeletionCountdown } from "@/lib/soft-delete";

export type RecentlyDeletedPanelItem = {
  id: string;
  deletedAt: Date;
  title: string;
  subtitle?: string;
  restore: () => Promise<{ error?: string; success?: boolean }>;
};

export function RecentlyDeletedPanel({
  items,
  emptyMessage,
}: {
  items: RecentlyDeletedPanelItem[];
  emptyMessage: string;
}) {
  if (items.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Trash2 className="size-4 text-muted-foreground" />
            Recently deleted
          </CardTitle>
          <CardDescription>
            Deleted records can be restored within 48 hours.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Trash2 className="size-4 text-muted-foreground" />
          Recently deleted
        </CardTitle>
        <CardDescription>
          Restore within 48 hours — records are permanently removed after that.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.map((item) => (
          <div
            key={item.id}
            className="flex flex-wrap items-start justify-between gap-3 rounded-lg border bg-muted/20 p-4"
          >
            <div className="min-w-0 space-y-1">
              <p className="font-medium">{item.title}</p>
              {item.subtitle && (
                <p className="text-sm text-muted-foreground">{item.subtitle}</p>
              )}
              <p className="text-xs text-muted-foreground">
                Deleted {item.deletedAt.toLocaleString()} ·{" "}
                {formatDeletionCountdown(item.deletedAt)}
              </p>
            </div>
            <RestoreRecordButton onRestore={item.restore} />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
