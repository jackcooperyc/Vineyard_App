import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getIrrigationPumpById } from "@/domains/pumps/queries";

export default async function PumpDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const pump = await getIrrigationPumpById(id);

  if (!pump) {
    notFound();
  }

  const [lng, lat] = pump.gpsPoint.coordinates;

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          render={<Link href="/pumps" aria-label="Back to pumps" />}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">
            {pump.name ?? "Unnamed pump"}
          </h2>
          <p className="text-sm text-muted-foreground">
            {pump.flowCapacity != null
              ? `${pump.flowCapacity} GPM`
              : "Flow capacity not set"}
          </p>
        </div>
      </div>

      <Button
        variant="outline"
        className="min-h-11"
        render={<Link href={`/map?pump=${pump.id}`} />}
      >
        <MapPin className="size-4" />
        View on map
      </Button>

      <Card>
        <CardHeader>
          <CardTitle>Location</CardTitle>
          <CardDescription>GPS point (GeoJSON)</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-mono text-sm">
            {lat.toFixed(6)}, {lng.toFixed(6)}
          </p>
        </CardContent>
      </Card>

      {pump.servicedBlocks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Serviced blocks</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {pump.servicedBlocks.map((block) => (
              <Link
                key={block.id}
                href={`/blocks/${block.id}`}
                className="block text-sm hover:text-primary"
              >
                {block.code} — {block.name}
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {pump.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm whitespace-pre-wrap">{pump.notes}</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
