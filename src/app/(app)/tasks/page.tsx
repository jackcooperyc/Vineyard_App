import { ComingSoonPlaceholder } from "@/components/shared/coming-soon";

export default function TasksPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Tasks</h2>
        <p className="text-muted-foreground">
          Vineyard work tracking tied to blocks
        </p>
      </div>
      <ComingSoonPlaceholder
        title="Task management"
        description="Assign and complete pruning, spraying, harvesting, and inspection work. Quick log from block detail and map drawer."
        sprint="Sprint 2"
      />
    </div>
  );
}
