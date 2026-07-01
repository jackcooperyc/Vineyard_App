import Link from "next/link";
import { Plus, RotateCcw, Tractor, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";

type EmptyContext = {
  hasFilters: boolean;
  statusFilter?: string;
  search?: string;
  typeFilter?: string;
};

export function EquipmentEmptyState({ context }: { context: EmptyContext }) {
  if (context.hasFilters) {
    return (
      <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
        <Tractor className="mx-auto mb-3 size-10 text-muted-foreground" />
        <h3 className="text-lg font-semibold">No equipment matches</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          {context.search
            ? `Nothing found for “${context.search}”.`
            : context.typeFilter
              ? `No ${context.typeFilter} assets with the current filters.`
              : "Try adjusting your filters or search."}
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Button
            variant="outline"
            className="min-h-11 gap-2"
            render={<Link href="/equipment" />}
          >
            <RotateCcw className="size-4" />
            Clear filters
          </Button>
          <Button className="min-h-11 gap-2" render={<Link href="/equipment/new" />}>
            <Plus className="size-4" />
            Add equipment
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-dashed bg-muted/20 px-6 py-10 text-center">
      <Tractor className="mx-auto mb-3 size-10 text-muted-foreground" />
      <h3 className="text-lg font-semibold">No equipment yet</h3>
      <p className="mt-1 text-sm text-muted-foreground">
        Add tractors, sprayers, and tools to track service schedules and tasks.
      </p>
      <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
        <Button className="min-h-11 gap-2" render={<Link href="/equipment/new" />}>
          <Plus className="size-4" />
          Add equipment
        </Button>
        <Button
          variant="outline"
          className="min-h-11 gap-2"
          render={<Link href="/equipment?status=NEEDS_SERVICE" />}
        >
          <Wrench className="size-4" />
          View service queue
        </Button>
      </div>
    </div>
  );
}
