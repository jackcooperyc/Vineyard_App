"use client";

import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TaskSearchInput, buildHref } from "@/components/tasks/task-search-input";
import { TASK_TYPES, TASK_TYPE_LABELS } from "@/domains/tasks/constants";
import type { TaskSortOption } from "@/domains/tasks/queries";
import type { TaskType } from "@/generated/prisma/client";

const statusFilters = [
  { value: "OPEN", label: "Open" },
  { value: "ALL", label: "All" },
  { value: "PENDING", label: "Pending" },
  { value: "IN_PROGRESS", label: "In progress" },
  { value: "COMPLETED", label: "Completed" },
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

export function TaskFilterBar({
  blocks = [],
  users = [],
  equipment = [],
}: {
  blocks?: BlockOption[];
  users?: UserOption[];
  equipment?: EquipmentOption[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentStatus = searchParams.get("status") ?? "OPEN";
  const currentType = searchParams.get("type");
  const currentSort = (searchParams.get("sort") as TaskSortOption) ?? "dueDate";
  const currentBlockId = searchParams.get("blockId");
  const currentQuery = searchParams.get("q") ?? "";

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

  return (
    <div className="space-y-3">
      <TaskSearchInput key={currentQuery} initialQuery={currentQuery} />

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
            className="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-border px-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            <RotateCcw className="size-3.5" />
            Clear all
          </Link>
        )}
      </div>

      <div className="flex gap-2 overflow-x-auto pb-1">
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
        <Link
          href={buildHref(pathname, searchParams, { type: null })}
          className={cn(
            "inline-flex min-h-9 shrink-0 items-center rounded-full border px-3 text-xs font-medium transition-colors",
            !currentType
              ? "border-primary bg-primary text-primary-foreground"
              : "border-border bg-background text-muted-foreground hover:bg-muted",
          )}
        >
          All types
        </Link>
        {TASK_TYPES.map((type) => {
          const href = buildHref(pathname, searchParams, { type });
          const active = currentType === type;

          return (
            <Link
              key={type}
              href={href}
              className={cn(
                "inline-flex min-h-9 shrink-0 items-center rounded-full border px-3 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-background text-muted-foreground hover:bg-muted",
              )}
            >
              {TASK_TYPE_LABELS[type as TaskType]}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
