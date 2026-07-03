"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BlockFilter = { id: string; code: string; name: string };
type BlockOption = { id: string; code: string; name: string };

const activeFilters = [
  { value: "all", label: "All schedules", shortLabel: "All" },
  { value: "active", label: "Active only", shortLabel: "Active" },
  { value: "inactive", label: "Inactive only", shortLabel: "Inactive" },
] as const;

const recordRangeFilters = [
  { value: "all", label: "All time", shortLabel: "All time" },
  { value: "week", label: "This week", shortLabel: "This week" },
  { value: "month", label: "This month", shortLabel: "This month" },
] as const;

const recordStatusFilters = [
  { value: "all", label: "All statuses", shortLabel: "All" },
  { value: "APPLIED", label: "Applied", shortLabel: "Applied" },
  { value: "SCHEDULED", label: "Scheduled", shortLabel: "Sched." },
  { value: "MISSED", label: "Missed", shortLabel: "Missed" },
  { value: "SKIPPED", label: "Skipped", shortLabel: "Skipped" },
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

function hasActiveFilters(searchParams: URLSearchParams) {
  return (
    searchParams.has("blockId") ||
    searchParams.has("active") ||
    searchParams.has("range") ||
    searchParams.has("status") ||
    searchParams.has("q")
  );
}

function countAdvancedFilters(
  searchParams: URLSearchParams,
  view: "schedules" | "records" | "alerts" | "deleted",
) {
  let count = 0;
  if (searchParams.has("blockId")) count++;
  if (view === "records" && searchParams.has("status") && searchParams.get("status") !== "all") {
    count++;
  }
  return count;
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

function FilterChipRow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        className,
      )}
    >
      {children}
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
  view?: "schedules" | "records" | "alerts" | "deleted";
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentBlockId = searchParams.get("blockId");
  const currentActive = searchParams.get("active") ?? "all";
  const currentRange = searchParams.get("range") ?? "all";
  const currentStatus = searchParams.get("status") ?? "all";
  const currentQuery = searchParams.get("q") ?? "";
  const advancedFilterCount = countAdvancedFilters(searchParams, view);
  const [filtersOpen, setFiltersOpen] = useState(advancedFilterCount > 0);

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

  const blockSelect =
    blocks.length > 0 ? (
      <Select value={currentBlockId ?? "all"} onValueChange={handleBlockChange}>
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
    ) : null;

  const clearAllLink = hasActiveFilters(searchParams) ? (
    <Link
      href={buildHref(pathname, searchParams, {
        blockId: null,
        active: null,
        range: null,
        status: null,
        q: null,
      })}
      className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted sm:justify-start"
    >
      <RotateCcw className="size-3.5" />
      Clear all
    </Link>
  ) : null;

  const recordStatusChips = (
    <FilterChipRow>
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
              "inline-flex min-h-10 shrink-0 items-center rounded-full border px-3 text-xs font-medium transition-colors touch-manipulation",
              active
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            <span className="sm:hidden">{filter.shortLabel}</span>
            <span className="hidden sm:inline">{filter.label}</span>
          </Link>
        );
      })}
    </FilterChipRow>
  );

  const advancedFilters = (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
        {blockSelect}
        {clearAllLink}
      </div>
      {view === "records" && recordStatusChips}
    </div>
  );

  return (
    <div className="sticky top-0 z-10 -mx-4 space-y-3 bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      {blockFilter && (
        <div className="flex items-center gap-2">
          <span className="inline-flex min-h-9 items-center gap-2 rounded-full border border-primary/30 bg-primary/5 px-3 text-sm">
            <span className="font-mono text-xs text-muted-foreground">
              {blockFilter.code}
            </span>
            <span className="font-medium">{blockFilter.name}</span>
            <Link
              href={buildHref(pathname, searchParams, { blockId: null })}
              className="ml-1 flex size-8 items-center justify-center rounded-full hover:bg-muted touch-manipulation"
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
          <FilterChipRow>
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
                    "inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors touch-manipulation",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  <span className="sm:hidden">{filter.shortLabel}</span>
                  <span className="hidden sm:inline">{filter.label}</span>
                </Link>
              );
            })}
          </FilterChipRow>

          <div className="md:hidden">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full justify-between gap-2"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
            >
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal className="size-4" />
                More filters
                {advancedFilterCount > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                    {advancedFilterCount}
                  </span>
                )}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 transition-transform",
                  filtersOpen && "rotate-180",
                )}
              />
            </Button>
            {filtersOpen && <div className="mt-3">{advancedFilters}</div>}
          </div>

          <div className="hidden md:block">{advancedFilters}</div>
        </>
      )}

      {view === "records" && (
        <>
          <FilterChipRow>
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
                    "inline-flex min-h-11 shrink-0 items-center rounded-full border px-4 text-sm font-medium transition-colors touch-manipulation",
                    active
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-muted-foreground hover:bg-muted",
                  )}
                >
                  {filter.label}
                </Link>
              );
            })}
          </FilterChipRow>

          <div className="md:hidden">
            <Button
              type="button"
              variant="outline"
              className="min-h-11 w-full justify-between gap-2"
              onClick={() => setFiltersOpen((open) => !open)}
              aria-expanded={filtersOpen}
            >
              <span className="inline-flex items-center gap-2">
                <SlidersHorizontal className="size-4" />
                More filters
                {advancedFilterCount > 0 && (
                  <span className="rounded-full bg-primary px-2 py-0.5 text-xs font-semibold text-primary-foreground">
                    {advancedFilterCount}
                  </span>
                )}
              </span>
              <ChevronDown
                className={cn(
                  "size-4 shrink-0 transition-transform",
                  filtersOpen && "rotate-180",
                )}
              />
            </Button>
            {filtersOpen && <div className="mt-3">{advancedFilters}</div>}
          </div>

          <div className="hidden space-y-3 md:block">
            <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
              {blockSelect}
              {clearAllLink}
            </div>
            {recordStatusChips}
          </div>
        </>
      )}

      {view === "alerts" && (
        <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
          {blockSelect}
          {clearAllLink}
        </div>
      )}
    </div>
  );
}
