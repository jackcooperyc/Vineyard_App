"use client";

import Link from "next/link";
import { useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, RotateCcw, Search, SlidersHorizontal, Trash2 } from "lucide-react";
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
import { EQUIPMENT_TYPES } from "@/domains/equipment/constants";

const statusFilters = [
  { value: "ALL", label: "All", shortLabel: "All" },
  { value: "ACTIVE", label: "Active", shortLabel: "Active" },
  { value: "IN_MAINTENANCE", label: "In maintenance", shortLabel: "Maint." },
  { value: "NEEDS_SERVICE", label: "Needs service", shortLabel: "Service" },
  { value: "RETIRED", label: "Retired", shortLabel: "Retired" },
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

const dueFilters = [
  { value: "all", label: "All due dates", shortLabel: "All due" },
  { value: "overdue", label: "Overdue", shortLabel: "Overdue" },
  { value: "week", label: "Due this week", shortLabel: "This week" },
  { value: "month", label: "Due this month", shortLabel: "This month" },
] as const;

const viewFilters = [
  { value: "list", label: "List", shortLabel: "List" },
  { value: "calendar", label: "Calendar", shortLabel: "Calendar" },
] as const;

function hasActiveFilters(searchParams: URLSearchParams) {
  return (
    searchParams.has("status") ||
    searchParams.has("type") ||
    searchParams.has("q") ||
    searchParams.has("due") ||
    (searchParams.has("view") &&
      searchParams.get("view") !== "list" &&
      searchParams.get("view") !== "deleted")
  );
}

function countAdvancedFilters(searchParams: URLSearchParams) {
  let count = 0;
  if (searchParams.has("type")) count++;
  if (searchParams.has("due") && searchParams.get("due") !== "all") count++;
  if (
    searchParams.has("view") &&
    searchParams.get("view") !== "list" &&
    searchParams.get("view") !== "deleted"
  ) {
    count++;
  }
  return count;
}

function EquipmentSearchInput({ initialQuery }: { initialQuery: string }) {
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
        placeholder="Search by name…"
        className="h-11 pl-9"
        aria-label="Search equipment by name"
      />
    </div>
  );
}

function FilterChipRow({ children }: { children: ReactNode }) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {children}
    </div>
  );
}

export function EquipmentFilterBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") ?? "ALL";
  const currentType = searchParams.get("type");
  const currentQuery = searchParams.get("q") ?? "";
  const currentDue = searchParams.get("due") ?? "all";
  const currentView = searchParams.get("view") ?? "list";
  const showDeleted = currentView === "deleted";
  const advancedFilterCount = countAdvancedFilters(searchParams);
  const [filtersOpen, setFiltersOpen] = useState(advancedFilterCount > 0);

  function handleTypeChange(value: string | null) {
    const href = buildHref(pathname, searchParams, {
      type: value && value !== "all" ? value : null,
    });
    router.push(href);
  }

  const advancedFilters = (
    <>
      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
        <Select value={currentType ?? "all"} onValueChange={handleTypeChange}>
          <SelectTrigger className="min-h-11 w-full sm:w-auto sm:min-w-[160px]">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            {EQUIPMENT_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {hasActiveFilters(searchParams) && (
          <Link
            href="/equipment"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted sm:justify-start"
          >
            <RotateCcw className="size-3.5" />
            Clear all
          </Link>
        )}
      </div>

      <FilterChipRow>
        {viewFilters.map((filter) => {
          const href = buildHref(pathname, searchParams, {
            view: filter.value === "list" ? null : filter.value,
          });
          const active =
            !showDeleted &&
            (currentView === filter.value ||
              (filter.value === "list" && !searchParams.get("view")));

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
              {filter.label}
            </Link>
          );
        })}
        <Link
          href={buildHref(pathname, searchParams, { view: "deleted" })}
          className={cn(
            "inline-flex min-h-10 shrink-0 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors touch-manipulation",
            showDeleted
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:bg-muted",
          )}
        >
          <Trash2 className="size-3.5" />
          <span className="sm:hidden">Deleted</span>
          <span className="hidden sm:inline">Recently deleted</span>
        </Link>
      </FilterChipRow>

      <FilterChipRow>
        {dueFilters.map((filter) => {
          const href = buildHref(pathname, searchParams, {
            due: filter.value === "all" ? null : filter.value,
          });
          const active =
            currentDue === filter.value ||
            (filter.value === "all" && !searchParams.get("due"));

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
    </>
  );

  return (
    <div className="sticky top-0 z-10 -mx-4 space-y-3 bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <EquipmentSearchInput key={currentQuery} initialQuery={currentQuery} />

      <FilterChipRow>
        {statusFilters.map((filter) => {
          const params = new URLSearchParams(searchParams.toString());
          if (filter.value === "ALL") {
            params.delete("status");
          } else {
            params.set("status", filter.value);
          }
          const href = params.toString() ? `${pathname}?${params}` : pathname;
          const active =
            currentStatus === filter.value ||
            (filter.value === "ALL" && !searchParams.get("status"));

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
        {filtersOpen && <div className="mt-3 space-y-3">{advancedFilters}</div>}
      </div>

      <div className="hidden space-y-3 md:block">{advancedFilters}</div>
    </div>
  );
}
