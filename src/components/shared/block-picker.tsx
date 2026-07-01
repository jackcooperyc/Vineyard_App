"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

export type BlockPickerItem = {
  id: string;
  code: string;
  name: string;
};

export function BlockPicker({
  blocks,
  value,
  onChange,
  className,
}: {
  blocks: BlockPickerItem[];
  value: string | null;
  onChange: (blockId: string) => void;
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
            const selected = value === block.id;
            return (
              <li key={block.id}>
                <button
                  type="button"
                  onClick={() => onChange(block.id)}
                  className={cn(
                    "field-tap flex w-full items-center justify-between gap-3 rounded-lg px-3 py-3 text-left transition-colors touch-manipulation",
                    selected
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted active:bg-muted/80",
                  )}
                >
                  <div>
                    <span
                      className={cn(
                        "font-mono text-xs",
                        selected
                          ? "text-primary-foreground/80"
                          : "text-muted-foreground",
                      )}
                    >
                      {block.code}
                    </span>
                    <p className="font-medium leading-tight">{block.name}</p>
                  </div>
                </button>
              </li>
            );
          })
        )}
      </ul>
    </div>
  );
}
