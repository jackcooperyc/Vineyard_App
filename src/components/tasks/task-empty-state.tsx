import Link from "next/link";
import { ClipboardPen, ListTodo, Plus, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyContext = {
  hasFilters: boolean;
  blockId?: string;
  blockCode?: string;
  statusFilter?: string;
  search?: string;
};

export function TaskEmptyState({
  context,
}: {
  context: EmptyContext;
}) {
  const newTaskHref = context.blockId
    ? `/tasks/new?blockId=${context.blockId}`
    : "/tasks/new";

  if (context.hasFilters) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
        <ListTodo className="mx-auto mb-3 size-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No tasks match</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {context.search
            ? `Nothing found for “${context.search}”.`
            : context.blockCode
              ? `No tasks for block ${context.blockCode} with the current filters.`
              : "Try adjusting your filters or search."}
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            className="min-h-11 gap-2"
            render={<Link href="/tasks" />}
          >
            <RotateCcw className="size-4" />
            Clear filters
          </Button>
          <Button className="min-h-11 gap-2" render={<Link href={newTaskHref} />}>
            <Plus className="size-4" />
            New task
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
      <ListTodo className="mx-auto mb-3 size-10 text-muted-foreground" />
      <h3 className="text-lg font-semibold">No open tasks</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Create a task or log work from the field to get started.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button className="min-h-11 gap-2" render={<Link href={newTaskHref} />}>
          <Plus className="size-4" />
          New task
        </Button>
        <Button
          variant="outline"
          className="min-h-11 gap-2"
          render={<Link href="/field" />}
        >
          <ClipboardPen className="size-4" />
          Field log
        </Button>
      </div>
    </div>
  );
}
