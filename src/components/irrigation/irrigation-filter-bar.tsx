"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { IrrigationRecordRange } from "@/domains/irrigation/queries";
import type { IrrigationStatus } from "@/generated/prisma/client";

type BlockFilter = { id: string; code: string; name: string };
type BlockOption = { id: string; code: string; name: string };

const activeFilters = [
  { value: "all", label: "All schedules" },
  { value: "active", label: "Active only" },
  { value: "inactive", label: "Inactive only" },
] as const;

const recordRangeFilters = [
  { value: "all", label: "All time" },
  { value: "week", label: "This week" },
  { value: "month", label: "This month" },
] as const;

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

const recordStatusFilters = [
  { value: "all", label: "All statuses" },
  { value: "APPLIED", label: "Applied" },
  { value: "SCHEDULED", label: "Scheduled" },
  { value: "MISSED", label: "Missed" },
  { value: "SKIPPED", label: "Skipped" },
] as const;

function hasActiveFilters(searchParams: URLSearchParams) {
  return (
    searchParams.has("blockId") ||
    searchParams.has("active") ||
    searchParams.has("range") ||
    searchParams.has("status") ||
    searchParams.has("q")
  );
}

function ScheduleSearchInput({ initialQuery }: { initialQuery: string }) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [searchInput, setSearchInput] = useState(initialQuery);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      const trimmed = searchInput.trim();
      if (trimmed === initialQuery) return;
      const href = buildHref(pathname, searchParams, {
        q: trimmed || null,
      });
      router.replace(href, { scroll: false });
    }, 300);
    return () => window.clearTimeout(timer);
  }, [searchInput, initialQuery, pathname, router, searchParams]);

  return (
    <div className="relative">
      <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
      <Input
        type="search"
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        placeholder="Search schedules…"
        className="h-11 pl-9"
        aria-label="Search irrigation schedules"
      />
    </div>
  );
}

export function IrrigationFilterBar({
  blockFilter,
  blocks = [],
  view = "schedules",
}: {
  blockFilter?: BlockFilter;
  blocks?: BlockOption[];
  view?: "schedules" | "records" | "alerts";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentBlockId = searchParams.get("blockId");
  const currentActive = searchParams.get("active") ?? "all";
  const currentRange = searchParams.get("range") ?? "all";
  const currentStatus = searchParams.get("status") ?? "all";
  const currentQuery = searchParams.get("q") ?? "";

  const sortedBlocks = [...blocks].sort((a, b) => {
    const aNum = Number.parseInt(a.code, 10);
    const bNum = Number.parseInt(b.code, 10);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
    return a.code.localeCompare(b.code);
  });

  function handleBlockChange(value: string | null) {
    const href = buildHref(pathname, searchParams, {
      blockId: value && value !== "all" ? value : null,
    });
    router.push(href);
  }

  return (
    <div className="sticky top-0 z-10 -mx-4 space-y-3 bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="flex flex-wrap items-center gap-2">
        {blocks.length > 0 && (
          <Select
            value={currentBlockId ?? "all"}
            onValueChange={handleBlockChange}
          >
            <SelectTrigger className="min-h-11 w-full sm:w-auto sm:min-w-[180px]">
              <SelectValue placeholder="All blocks" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All blocks</SelectItem>
              {sortedBlocks.map((block) => (
                <SelectItem key={block.id} value={block.id}>
                  {block.code} · {block.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters(searchParams) && (
          <Link
            href={buildHref(pathname, searchParams, {
              blockId: null,
              active: null,
              range: null,
              status: null,
              q: null,
            })}
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            <RotateCcw className="size-3.5" />
            Clear all
          </Link>
        )}
      </div>

      {blockFilter && (
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
      )}

      {view === "schedules" && (
        <>
          <ScheduleSearchInput key={currentQuery} initialQuery={currentQuery} />
          <div className="flex gap-2 overflow-x-auto pb-1">
            {activeFilters.map((filter) => {
            const href = buildHref(pathname, searchParams, {
              active: filter.value === "all" ? null : filter.value,
            });
            const active =
              currentActive === filter.value ||
              (filter.value === "all" && !searchParams.get("active"));

            return (
              <Link
                key={filter.value}
                href={href}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted",
                )}
              >
                {filter.label}
              </Link>
            );
          })}
          </div>
        </>
      )}

      {view === "records" && (
        <>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recordRangeFilters.map((filter) => {
            const href = buildHref(pathname, searchParams, {
              range: filter.value === "all" ? null : filter.value,
            });
            const active =
              currentRange === filter.value ||
              (filter.value === "all" && !searchParams.get("range"));

            return (
              <Link
                key={filter.value}
                href={href}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted",
                )}
              >
                {filter.label}
              </Link>
            );
          })}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {recordStatusFilters.map((filter) => {
              const href = buildHref(pathname, searchParams, {
                status: filter.value === "all" ? null : filter.value,
              });
              const active =
                currentStatus === filter.value ||
                (filter.value === "all" && !searchParams.get("status"));

              return (
                <Link
                  key={filter.value}
                  href={href}
                  className={cn(
                    "inline-flex min-h-9 shrink-0 items-center rounded-full border px-3 text-xs font-medium transition-colors",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {filter.label}
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}

export function parseIrrigationActiveFilter(
  value: string | undefined,
): "all" | "active" | "inactive" {
  if (value === "active" || value === "inactive") return value;
  return "all";
}

export function parseIrrigationRecordRange(
  value: string | undefined,
): IrrigationRecordRange | undefined {
  if (value === "week" || value === "month") return value;
  return undefined;
}

export function parseIrrigationRecordStatus(
  value: string | undefined,
): IrrigationStatus | undefined {
  if (
    value === "APPLIED" ||
    value === "SCHEDULED" ||
    value === "MISSED" ||
    value === "SKIPPED"
  ) {
    return value;
  }
  return undefined;
}

export function irrigationFiltersAreActive(params: {
  blockId?: string;
  active?: string;
  range?: string;
  view?: string;
  status?: string;
  q?: string;
}) {
  return Boolean(
    params.blockId || params.active || params.range || params.status || params.q,
  );
}
