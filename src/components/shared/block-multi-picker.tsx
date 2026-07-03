"use client";

import { useMemo, useState } from "react";
import { Search, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import type { BlockPickerItem } from "@/components/shared/block-picker";

export function BlockMultiPicker({
  blocks,
  selectedIds,
  primaryId,
  onChange,
  className,
}: {
  blocks: BlockPickerItem[];
  selectedIds: string[];
  primaryId: string | null;
  onChange: (selectedIds: string[], primaryId: string) => void;
  className?: string;
}) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return blocks;
    return blocks.filter(
      (b) =>
        b.code.toLowerCase().includes(q) ||
        b.name.toLowerCase().includes(q),
    );
  }, [blocks, query]);

  function toggleBlock(blockId: string) {
    if (selectedIds.includes(blockId)) {
      if (selectedIds.length === 1) return;
      const next = selectedIds.filter((id) => id !== blockId);
      const nextPrimary =
        primaryId === blockId ? next[0]! : (primaryId ?? next[0]!);
      onChange(next, nextPrimary);
      return;
    }
    const next = [...selectedIds, blockId];
    onChange(next, primaryId ?? blockId);
  }

  function setPrimary(blockId: string) {
    if (!selectedIds.includes(blockId)) {
      onChange([...selectedIds, blockId], blockId);
      return;
    }
    onChange(selectedIds, blockId);
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search block code or name…"
          className="h-12 pl-10 text-base"
          aria-label="Search blocks"
        />
      </div>
      <ul className="max-h-52 space-y-2 overflow-y-auto overscroll-contain rounded-lg border p-2 md:max-h-64">
        {filtered.length === 0 ? (
          <li className="px-3 py-6 text-center text-sm text-muted-foreground">
            No blocks match your search.
          </li>
        ) : (
          filtered.map((block) => {
            const selected = selectedIds.includes(block.id);
            const isPrimary = primaryId === block.id;
            return (
              <li key={block.id}>
                <div
                  className={cn(
                    "flex items-center gap-2 rounded-lg px-2 py-2",
                    selected && "bg-muted/50",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => toggleBlock(block.id)}
                    aria-label={`Select ${block.code}`}
                    className="size-5 shrink-0 rounded border-input"
                  />
                  <button
                    type="button"
                    onClick={() => toggleBlock(block.id)}
                    className="field-tap min-w-0 flex-1 text-left touch-manipulation"
                  >
                    <span className="font-mono text-xs text-muted-foreground">
                      {block.code}
                    </span>
                    <p className="font-medium leading-tight">{block.name}</p>
                  </button>
                  {selected && (
                    <button
                      type="button"
                      onClick={() => setPrimary(block.id)}
                      className={cn(
                        "field-tap shrink-0 rounded-md p-2 touch-manipulation",
                        isPrimary
                          ? "text-amber-500"
                          : "text-muted-foreground hover:text-foreground",
                      )}
                      aria-label={
                        isPrimary
                          ? `${block.code} is primary block`
                          : `Set ${block.code} as primary block`
                      }
                      title={isPrimary ? "Primary block" : "Set as primary"}
                    >
                      <Star
                        className={cn("size-5", isPrimary && "fill-current")}
                      />
                    </button>
                  )}
                </div>
              </li>
            );
          })
        )}
      </ul>
      <input
        type="hidden"
        name="blockIds"
        value={JSON.stringify(selectedIds)}
      />
      <input type="hidden" name="primaryBlockId" value={primaryId ?? ""} />
      <p className="text-xs text-muted-foreground">
        Select one or more blocks. Star marks the primary block for map links and
        GPS start.
      </p>
    </div>
  );
}

export function formatTaskBlockLabel(
  blocks: { code: string }[],
  primary?: { code: string },
): string {
  if (blocks.length <= 1) {
    const b = blocks[0] ?? primary;
    return b?.code ?? "";
  }
  const codes = blocks.map((b) => b.code);
  if (codes.length === 2) {
    return `${codes[0]} · ${codes[1]}`;
  }
  return `${codes[0]} · ${codes[1]} +${codes.length - 2}`;
}
