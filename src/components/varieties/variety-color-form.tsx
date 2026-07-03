import { VarietyColorRow } from "@/components/varieties/variety-color-row";
import type { VarietySettingsItem } from "@/domains/varieties/queries";

export function VarietyColorForm({
  varieties,
}: {
  varieties: VarietySettingsItem[];
}) {
  if (varieties.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">No varieties configured.</p>
    );
  }

  return (
    <div className="space-y-3">
      {varieties.map((variety) => (
        <VarietyColorRow key={variety.id} variety={variety} />
      ))}
    </div>
  );
}
