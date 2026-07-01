import { getVineyardBlocksForField } from "@/domains/blocks/queries";
import { FieldLogPanel } from "@/components/field/field-log-panel";

export default async function FieldPage() {
  const blocks = await getVineyardBlocksForField();

  return (
    <div className="field-readable mx-auto max-w-lg space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Field log</h2>
        <p className="text-muted-foreground">
          One-handed logging for tasks and irrigation in the vineyard.
        </p>
      </div>
      <FieldLogPanel blocks={blocks} />
    </div>
  );
}
