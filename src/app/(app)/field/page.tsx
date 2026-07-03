import { getVineyardBlocksForField } from "@/domains/blocks/queries";
import { getActiveEquipmentForSelect } from "@/domains/equipment/queries";
import { FieldLogPanel } from "@/components/field/field-log-panel";
import { getQuickLogTaskTypes } from "@/domains/tasks/type-queries";

export default async function FieldPage() {
  const [blocks, equipment, quickLogTypes] = await Promise.all([
    getVineyardBlocksForField(),
    getActiveEquipmentForSelect(),
    getQuickLogTaskTypes(),
  ]);

  return (
    <div className="field-readable mx-auto max-w-lg space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Field log</h2>
        <p className="text-muted-foreground">
          One-handed logging for tasks, irrigation, and equipment service in the
          vineyard.
        </p>
      </div>
      <FieldLogPanel
        blocks={blocks}
        equipment={equipment}
        quickLogTypes={quickLogTypes}
      />
    </div>
  );
}
