import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PumpForm } from "@/components/pumps/pump-form";
import { getVineyardBlocksForPumpForm } from "@/domains/pumps/queries";

export default async function NewPumpPage() {
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
  const blocks = await getVineyardBlocksForPumpForm();

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          render={<Link href="/pumps" aria-label="Back to pumps" />}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Add pump</h2>
          <p className="text-sm text-muted-foreground">
            Register an irrigation pump for map pins and block coverage
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pump details</CardTitle>
        </CardHeader>
        <CardContent>
          <PumpForm blocks={blocks} mapboxToken={mapboxToken} />
        </CardContent>
      </Card>
    </div>
  );
}
