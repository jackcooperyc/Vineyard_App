"use client";

import Link from "next/link";
import { MapPin } from "lucide-react";
import { BlockStatusBadge } from "@/components/blocks/block-status-badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { MapBlock } from "@/domains/map/types";

export function MapPlaceholder({ blocks = [] }: { blocks?: MapBlock[] }) {
  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center gap-2 text-lg">
          <MapPin className="size-5 text-primary" />
          Vineyard map
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="relative flex aspect-[4/3] items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/25 bg-muted/30 md:aspect-[16/9]">
          <div className="max-w-sm space-y-2 px-6 text-center">
            <p className="text-sm font-medium">Mapbox token required</p>
            <p className="text-xs text-muted-foreground">
              Set{" "}
              <code className="rounded bg-muted px-1">NEXT_PUBLIC_MAPBOX_TOKEN</code>{" "}
              in <code className="rounded bg-muted px-1">.env</code> to load the
              live block map. Get a free token at{" "}
              <a
                href="https://account.mapbox.com/access-tokens/"
                className="text-primary underline-offset-2 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                mapbox.com
              </a>
              .
            </p>
          </div>
          <div className="pointer-events-none absolute inset-4 grid grid-cols-4 grid-rows-3 gap-2 opacity-40">
            {Array.from({ length: Math.max(blocks.length, 8) }).map((_, i) => (
              <div
                key={i}
                className="rounded border border-emerald-600/50 bg-emerald-500/20"
              />
            ))}
          </div>
        </div>
        {blocks.length > 0 && (
          <ul className="divide-y rounded-lg border text-sm">
            {blocks.map((block) => (
              <li key={block.id}>
                <Link
                  href={`/blocks/${block.id}`}
                  className="flex items-center justify-between gap-3 px-3 py-2 hover:bg-muted/50"
                >
                  <div>
                    <span className="font-mono text-xs text-muted-foreground">
                      {block.code}
                    </span>
                    <p className="font-medium">{block.name}</p>
                  </div>
                  <BlockStatusBadge status={block.status} />
                </Link>
              </li>
            ))}
          </ul>
        )}
        <ul className="space-y-1 text-sm text-muted-foreground">
          <li>· Block boundaries stored as GeoJSON in the database</li>
          <li>· Tap blocks on the map for quick task and irrigation logging</li>
          <li>· Status overlays highlight open tasks and irrigation alerts</li>
        </ul>
      </CardContent>
    </Card>
  );
}
