"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw, Search } from "lucide-react";
import { cn } from "@/lib/utils";
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
  { value: "ALL", label: "All" },
  { value: "ACTIVE", label: "Active" },
  { value: "IN_MAINTENANCE", label: "In maintenance" },
  { value: "NEEDS_SERVICE", label: "Needs service" },
  { value: "RETIRED", label: "Retired" },
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
  { value: "all", label: "All due dates" },
  { value: "overdue", label: "Overdue" },
  { value: "week", label: "Due this week" },
  { value: "month", label: "Due this month" },
] as const;

const viewFilters = [
  { value: "list", label: "List" },
  { value: "calendar", label: "Calendar" },
] as const;

function hasActiveFilters(searchParams: URLSearchParams) {
  return (
    searchParams.has("status") ||
    searchParams.has("type") ||
    searchParams.has("q") ||
    searchParams.has("due") ||
    (searchParams.has("view") && searchParams.get("view") !== "list")
  );
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

export function EquipmentFilterBar() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") ?? "ALL";
  const currentType = searchParams.get("type");
  const currentQuery = searchParams.get("q") ?? "";
  const currentDue = searchParams.get("due") ?? "all";
  const currentView = searchParams.get("view") ?? "list";

  function handleTypeChange(value: string | null) {
    const href = buildHref(pathname, searchParams, {
      type: value && value !== "all" ? value : null,
    });
    router.push(href);
  }

  return (
    <div className="sticky top-0 z-10 -mx-4 space-y-3 bg-background/95 px-4 py-2 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <EquipmentSearchInput key={currentQuery} initialQuery={currentQuery} />

      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={currentType ?? "all"}
          onValueChange={handleTypeChange}
        >
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
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            <RotateCcw className="size-3.5" />
            Clear all
          </Link>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
        {viewFilters.map((filter) => {
          const href = buildHref(pathname, searchParams, {
            view: filter.value === "list" ? null : filter.value,
          });
          const active =
            currentView === filter.value ||
            (filter.value === "list" && !searchParams.get("view"));

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

      <div className="flex gap-2 overflow-x-auto pb-1">
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

      <div className="flex gap-2 overflow-x-auto pb-1">
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
    </div>
  );
}
