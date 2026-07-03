import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { buildTasksHubHref } from "@/lib/hub-back-href";
import type { TasksHubParams } from "@/lib/hub-back-href";

export function TasksPagination({
  total,
  page,
  pageSize,
  hubParams,
}: {
  total: number;
  page: number;
  pageSize: number;
  hubParams: TasksHubParams;
}) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1) return null;

  const prevParams = { ...hubParams, page: page > 2 ? String(page - 1) : undefined };
  const nextParams = { ...hubParams, page: String(page + 1) };

  return (
    <div className="flex items-center justify-between gap-4 border-t pt-4">
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages} · {total} task{total !== 1 ? "s" : ""}
      </p>
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="min-h-10 gap-1"
          disabled={page <= 1}
          render={
            page > 1 ? (
              <Link href={buildTasksHubHref(prevParams)} />
            ) : undefined
          }
        >
          <ChevronLeft className="size-4" />
          Prev
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="min-h-10 gap-1"
          disabled={page >= totalPages}
          render={
            page < totalPages ? (
              <Link href={buildTasksHubHref(nextParams)} />
            ) : undefined
          }
        >
          Next
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
