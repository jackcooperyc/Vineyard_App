import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { BlockStatusBadge } from "@/components/blocks/block-status-badge";
import type { BlockListItem } from "@/domains/blocks/queries";

export function BlockListCard({ block }: { block: BlockListItem }) {
  return (
    <Link href={`/blocks/${block.id}`} className="block">
      <Card className="transition-colors hover:bg-muted/40 active:bg-muted/60">
        <CardContent className="flex min-h-[72px] items-center gap-3 p-4">
          <div className="flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground">
                {block.code}
              </span>
              <BlockStatusBadge status={block.status} />
            </div>
            <p className="font-medium leading-tight">{block.name}</p>
            <p className="text-sm text-muted-foreground">
              {block.primaryVariety ?? "No variety"}
              {block.totalVines > 0 && ` · ${block.totalVines.toLocaleString()} vines`}
              {block.yearPlanted && ` · ${block.yearPlanted}`}
            </p>
          </div>
          <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
        </CardContent>
      </Card>
    </Link>
  );
}
