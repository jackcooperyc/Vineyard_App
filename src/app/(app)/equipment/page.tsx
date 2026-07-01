import { ComingSoonPlaceholder } from "@/components/shared/coming-soon";

export default function EquipmentPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Equipment</h2>
        <p className="text-muted-foreground">
          Tractors, sprayers, and maintenance records
        </p>
      </div>
      <ComingSoonPlaceholder
        title="Equipment management"
        description="Track assets, maintenance schedules, usage history, and task assignments."
        sprint="Sprint 3"
      />
    </div>
  );
}
