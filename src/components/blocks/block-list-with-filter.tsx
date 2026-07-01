"use client";

import { useState } from "react";
import type { BlockListItem } from "@/domains/blocks/queries";
import { BlockListCard } from "@/components/blocks/block-list-card";
import { cn } from "@/lib/utils";

type Filter = "all" | "vineyard" | "infrastructure";

export function BlockListWithFilter({
  blocks,
  vineyardCount,
  infrastructureCount,
}: {
  blocks: BlockListItem[];
  vineyardCount: number;
  infrastructureCount: number;
}) {
  const filters: { id: Filter; label: string; count: number }[] = [
    { id: "all", label: "All", count: blocks.length },
    { id: "vineyard", label: "Vineyard", count: vineyardCount },
    {
      id: "infrastructure",
      label: "Infrastructure",
      count: infrastructureCount,
    },
  ];

  const [filter, setFilter] = useState<Filter>("vineyard");

  const visible = blocks.filter((block) => {
    if (filter === "all") return true;
    if (filter === "vineyard") return block.blockType === "VINEYARD";
    return block.blockType === "INFRASTRUCTURE";
  });

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFilter(f.id)}
            className={cn(
              "field-tap shrink-0 rounded-full border px-4 py-2 text-sm font-medium touch-manipulation",
              filter === f.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card",
            )}
          >
            {f.label} ({f.count})
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {visible.map((block) => (
          <BlockListCard key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}
