"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskSearchInput, buildHref } from "@/components/tasks/task-search-input";
import type { TaskSortOption } from "@/domains/tasks/queries";
import type { TaskTypeConfig } from "@/domains/tasks/types";

const statusFilters = [
  { value: "OPEN", label: "Open" },
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Done" },
] as const;

type BlockOption = { id: string; code: string; name: string };
type UserOption = { id: string; name: string | null; email: string };
type EquipmentOption = { id: string; name: string; type: string };

function hasActiveFilters(searchParams: URLSearchParams) {
  return (
    searchParams.has("status") ||
    searchParams.has("blockId") ||
    searchParams.has("type") ||
    searchParams.has("q") ||
    searchParams.has("sort") ||
    searchParams.has("due") ||
    searchParams.has("view") ||
    searchParams.has("assignee") ||
    searchParams.has("equipmentId") ||
    searchParams.has("page")
  );
}

function countAdvancedFilters(searchParams: URLSearchParams) {
  let count = 0;
  if (searchParams.has("blockId")) count++;
  if (searchParams.has("type")) count++;
  if (searchParams.has("sort") && searchParams.get("sort") !== "dueDate") count++;
  if (searchParams.has("due")) count++;
  if (searchParams.has("assignee")) count++;
  if (searchParams.has("equipmentId")) count++;
  return count;
}

export function TaskFilterBar({
  blocks = [],
  users = [],
  equipment = [],
  taskTypes = [],
}: {
  blocks?: BlockOption[];
  users?: UserOption[];
  equipment?: EquipmentOption[];
  taskTypes?: TaskTypeConfig[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") ?? "OPEN";
  const currentType = searchParams.get("type");
  const currentSort = (searchParams.get("sort") as TaskSortOption) ?? "dueDate";
  const currentBlockId = searchParams.get("blockId");
  const currentQuery = searchParams.get("q") ?? "";
  const advancedFilterCount = countAdvancedFilters(searchParams);
  const [filtersOpen, setFiltersOpen] = useState(advancedFilterCount > 0);

  const sortedBlocks = useMemo(
    () =>
      [...blocks].sort((a, b) => {
        const aNum = Number.parseInt(a.code, 10);
        const bNum = Number.parseInt(b.code, 10);
        if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
        return a.code.localeCompare(b.code);
      }),
    [blocks],
  );

  const activeTypes = taskTypes.filter((t) => t.active);

  function handleBlockChange(value: string | null) {
    const href = buildHref(pathname, searchParams, {
      blockId: value && value !== "all" ? value : null,
    });
    router.push(href);
  }

  function handleSortChange(value: string | null) {
    const href = buildHref(pathname, searchParams, {
      sort: value && value !== "dueDate" ? value : null,
    });
    router.push(href);
  }

  function handleAssigneeChange(value: string | null) {
    const href = buildHref(pathname, searchParams, {
      assignee: value && value !== "all" ? value : null,
      page: null,
    });
    router.push(href);
  }

  function handleEquipmentChange(value: string | null) {
    const href = buildHref(pathname, searchParams, {
      equipmentId: value && value !== "all" ? value : null,
      page: null,
    });
    router.push(href);
  }

  const advancedFilters = (
    <>
      <div className="grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:items-center">
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

        <Select value={currentSort} onValueChange={handleSortChange}>
          <SelectTrigger className="min-h-11 w-full sm:w-auto sm:min-w-[140px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dueDate">Due date</SelectItem>
            <SelectItem value="createdAt">Recently added</SelectItem>
            <SelectItem value="title">Title A–Z</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>

        {users.length > 0 && (
          <Select
            value={searchParams.get("assignee") ?? "all"}
            onValueChange={handleAssigneeChange}
          >
            <SelectTrigger className="min-h-11 w-full sm:w-auto sm:min-w-[160px]">
              <SelectValue placeholder="All assignees" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All assignees</SelectItem>
              {users.map((user) => (
                <SelectItem key={user.id} value={user.id}>
                  {user.name ?? user.email}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {equipment.length > 0 && (
          <Select
            value={searchParams.get("equipmentId") ?? "all"}
            onValueChange={handleEquipmentChange}
          >
            <SelectTrigger className="min-h-11 w-full sm:w-auto sm:min-w-[160px]">
              <SelectValue placeholder="All equipment" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All equipment</SelectItem>
              {equipment.map((item) => (
                <SelectItem key={item.id} value={item.id}>
                  {item.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}

        {hasActiveFilters(searchParams) && (
          <Link
            href="/tasks"
            className="inline-flex min-h-11 items-center justify-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted sm:justify-start"
          >
            <RotateCcw className="size-3.5" />
            Clear all
          </Link>
        )}
      </div>

      {activeTypes.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <Link
            href={buildHref(pathname, searchParams, { type: null })}
            className={cn(
              "inline-flex min-h-10 shrink-0 items-center rounded-full border px-3 text-xs font-medium transition-colors touch-manipulation",
              !currentType
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted",
            )}
          >
            All types
          </Link>
          {activeTypes.map((type) => {
            const href = buildHref(pathname, searchParams, { type: type.slug });
            const active = currentType === type.slug;

            return (
              <Link
                key={type.id}
                href={href}
                className={cn(
                  "inline-flex min-h-10 shrink-0 items-center rounded-full border px-3 text-xs font-medium transition-colors touch-manipulation",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background text-muted-foreground hover:bg-muted",
                )}
              >
                {type.label}
              </Link>
            );
          })}
        </div>
      )}
    </>
  );

  return (
    <div className="space-y-3">
      <TaskSearchInput key={currentQuery} initialQuery={currentQuery} />

      <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {statusFilters.map((filter) => {
          const href = buildHref(pathname, searchParams, {
            status: filter.value === "OPEN" ? null : filter.value,
          });
          const active =
            currentStatus === filter.value ||
            (filter.value === "OPEN" && !searchParams.get("status"));

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
      </div>

      {/* Mobile: collapse advanced filters behind a toggle */}
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

      {/* Desktop: always show advanced filters */}
      <div className="hidden space-y-3 md:block">{advancedFilters}</div>
    </div>
  );
}
