import Link from "next/link";
import { Droplets, MapPin, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getIrrigationPumps } from "@/domains/pumps/queries";

export default async function PumpsPage() {
  const pumps = await getIrrigationPumps();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Irrigation pumps</h2>
          <p className="text-muted-foreground">
            Pump locations and serviced blocks for map overlays
          </p>
        </div>
        <Button size="touch" variant="outline" render={<Link href="/map" />}>
          <MapPin className="size-4" />
          Map view
        </Button>
        <Button size="touch" render={<Link href="/pumps/new" />}>
          <Plus className="size-4" />
          Add pump
        </Button>
      </div>

      {pumps.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center">
            <Droplets className="mx-auto mb-3 size-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              No pumps registered yet. Add a pump to show it on the vineyard map.
            </p>
            <Button className="mt-4 min-h-11" render={<Link href="/pumps/new" />}>
              Add first pump
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pumps.map((pump) => (
            <Card key={pump.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">
                  <Link href={`/pumps/${pump.id}`} className="hover:text-primary">
                    {pump.name ?? "Unnamed pump"}
                  </Link>
                </CardTitle>
                <CardDescription>
                  {pump.flowCapacity != null
                    ? `${pump.flowCapacity} GPM`
                    : "Flow capacity not set"}
                  {pump.servicedBlocks.length > 0 &&
                    ` · ${pump.servicedBlocks.length} block${pump.servicedBlocks.length !== 1 ? "s" : ""}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex items-center justify-between gap-3">
                <p className="font-mono text-xs text-muted-foreground">
                  {pump.gpsPoint.coordinates[1].toFixed(5)},{" "}
                  {pump.gpsPoint.coordinates[0].toFixed(5)}
                </p>
                <div className="flex shrink-0 items-center gap-2">
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm"
                    render={<Link href={`/pumps/${pump.id}/edit`} />}
                  >
                    <Pencil className="size-3.5" />
                    Edit
                  </Button>
                  <Button
                    variant="link"
                    className="h-auto p-0 text-sm"
                    render={<Link href={`/map?pump=${pump.id}`} />}
                  >
                    <MapPin className="size-3.5" />
                    Map
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
