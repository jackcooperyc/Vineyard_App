import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { VarietyColorForm } from "@/components/varieties/variety-color-form";
import type { VarietySettingsItem } from "@/domains/varieties/queries";

export function VarietyColorsSection({
  varieties,
}: {
  varieties: VarietySettingsItem[];
}) {
  return (
    <Card id="variety-colors" className="scroll-mt-20">
      <CardHeader>
        <CardTitle>Map colors by variety</CardTitle>
        <CardDescription>
          Colors apply estate-wide on the vineyard map. Toggle varietal mode on
          the map to preview.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <VarietyColorForm varieties={varieties} />
      </CardContent>
    </Card>
  );
}
