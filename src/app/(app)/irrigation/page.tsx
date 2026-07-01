import { ComingSoonPlaceholder } from "@/components/shared/coming-soon";

export default function IrrigationPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Irrigation</h2>
        <p className="text-muted-foreground">
          Schedules and application records by block
        </p>
      </div>
      <ComingSoonPlaceholder
        title="Irrigation workflows"
        description="Plan recurring irrigation, log water application by block, and surface overdue events."
        sprint="Sprint 4"
      />
    </div>
  );
}
