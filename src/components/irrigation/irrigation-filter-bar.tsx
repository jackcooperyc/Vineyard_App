"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { X } from "lucide-react";

type BlockFilter = { id: string; code: string; name: string };

function buildHref(
  pathname: string,
  searchParams: URLSearchParams,
  updates: Record<string, string | null>,
) {
  const params = new URLSearchParams(searchParams.toString());
  for (const [key, value] of Object.entries(updates)) {
    if (value === null) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
  }
  return params.toString() ? `${pathname}?${params}` : pathname;
}

export function IrrigationFilterBar({
  blockFilter,
}: {
  blockFilter?: BlockFilter;
}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (!blockFilter) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 text-sm">
        <span className="font-mono text-xs text-muted-foreground">
          {blockFilter.code}
        </span>
        <span className="font-medium">{blockFilter.name}</span>
        <Link
          href={buildHref(pathname, searchParams, { blockId: null })}
          className="ml-1 flex size-6 items-center justify-center rounded-full hover:bg-muted"
          aria-label="Clear block filter"
        >
          <X className="size-3.5" />
        </Link>
      </span>
    </div>
  );
}
