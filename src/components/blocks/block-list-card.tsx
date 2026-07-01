import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BlockStatusBadge } from "@/components/blocks/block-status-badge";
import type { BlockListItem } from "@/domains/blocks/queries";

export function BlockListCard({ block }: { block: BlockListItem }) {
  return (
    <Link href={`/blocks/${block.id}`} className="block">
      <Card className="transition-colors hover:bg-muted/40 active:bg-muted/60">
        <CardContent className="flex min-h-[4.5rem] items-center gap-3 p-4 touch-manipulation">
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {block.code}
              </span>
              <BlockStatusBadge status={block.status} />
              {block.blockType === "INFRASTRUCTURE" && (
                <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                  {block.infrastructureType ?? "Infra"}
                </span>
              )}
            </div>
            <p className="text-base font-medium leading-tight">{block.name}</p>
            <p className="text-sm text-muted-foreground">
              {block.blockType === "VINEYARD"
                ? (block.primaryVariety ?? "No variety")
                : (block.infrastructureType ?? "Infrastructure area")}
              {block.acreage != null && ` · ${block.acreage} ac`}
              {block.totalVines > 0 &&
                ` · ${block.totalVines.toLocaleString()} vines`}
            </p>
          </div>
          <ChevronRight className="size-6 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
