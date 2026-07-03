import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PumpForm } from "@/components/pumps/pump-form";
import {
  getIrrigationPumpById,
  getVineyardBlocksForPumpForm,
} from "@/domains/pumps/queries";

export default async function EditPumpPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN?.trim();
  const [pump, blocks] = await Promise.all([
    getIrrigationPumpById(id),
    getVineyardBlocksForPumpForm(),
  ]);

  if (!pump) {
    notFound();
  }

  const [lng, lat] = pump.gpsPoint.coordinates;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          render={<Link href={`/pumps/${pump.id}`} aria-label="Back to pump" />}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Edit pump</h2>
          <p className="text-sm text-muted-foreground">
            {pump.name ?? "Unnamed pump"}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pump details</CardTitle>
        </CardHeader>
        <CardContent>
          <PumpForm
            blocks={blocks}
            mapboxToken={mapboxToken}
            cancelHref={`/pumps/${pump.id}`}
            pump={{
              id: pump.id,
              name: pump.name,
              lat,
              lng,
              flowCapacity: pump.flowCapacity,
              servicedBlockIds: pump.servicedBlockIds,
              notes: pump.notes,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
