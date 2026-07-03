"use client";

import { useMemo, useState } from "react";
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
  const [varietyFilter, setVarietyFilter] = useState("all");

  const vineyardBlocks = useMemo(
    () => blocks.filter((block) => block.blockType === "VINEYARD"),
    [blocks],
  );

  const varietyOptions = useMemo(() => {
    const names = new Set<string>();
    for (const block of vineyardBlocks) {
      for (const variety of block.varieties) {
        names.add(variety);
      }
    }
    return [...names].sort((a, b) => a.localeCompare(b));
  }, [vineyardBlocks]);

  const visible = blocks.filter((block) => {
    if (filter === "all") return true;
    if (filter === "vineyard") {
      if (block.blockType !== "VINEYARD") return false;
      if (varietyFilter === "all") return true;
      return block.varieties.includes(varietyFilter);
    }
    return block.blockType === "INFRASTRUCTURE";
  });

  function handleFilterChange(next: Filter) {
    setFilter(next);
    if (next !== "vineyard") {
      setVarietyFilter("all");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => handleFilterChange(f.id)}
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

      {filter === "vineyard" && varietyOptions.length > 0 && (
        <select
          value={varietyFilter}
          onChange={(e) => setVarietyFilter(e.target.value)}
          aria-label="Filter by varietal type"
          className="field-tap min-h-10 w-full rounded-lg border border-input bg-background px-3 text-sm sm:w-auto"
        >
          <option value="all">All varieties</option>
          {varietyOptions.map((variety) => (
            <option key={variety} value={variety}>
              {variety}
            </option>
          ))}
        </select>
      )}

      <div className="space-y-3">
        {visible.map((block) => (
          <BlockListCard key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}
