import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VarietyColorForm } from "@/components/varieties/variety-color-form";
import { MapColorModePreference } from "@/components/varieties/map-color-mode-preference";
import {
  getVarietiesForSettings,
  getVineyardMapColorMode,
} from "@/domains/varieties/queries";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function VarietySettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const [varieties, mapColorMode] = await Promise.all([
    getVarietiesForSettings(),
    getVineyardMapColorMode(),
  ]);

  return (
    <div className="field-readable mx-auto max-w-3xl space-y-6 pb-4">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          render={<Link href="/map" aria-label="Back to map" />}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            Variety map colors
          </h2>
          <p className="text-muted-foreground">
            Set display colors for each grape variety on the vineyard map.
          </p>
        </div>
      </div>

      <VarietyColorForm varieties={varieties} />

      <MapColorModePreference currentMode={mapColorMode} />
    </div>
  );
}
