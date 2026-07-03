"use client";

import Link from "next/link";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { reorderTaskTypes } from "@/domains/tasks/type-actions";
import { TaskTypeIconPreview } from "@/components/tasks/settings/task-type-icon-picker";

type TaskTypeRow = {
  id: string;
  slug: string;
  label: string;
  iconName: string;
  sortOrder: number;
  active: boolean;
  showInQuickLog: boolean;
  _count: { tasks: number };
};

export function TaskTypeList({ types }: { types: TaskTypeRow[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function move(id: string, direction: "up" | "down") {
    const index = types.findIndex((t) => t.id === id);
    if (index < 0) return;
    const target = direction === "up" ? index - 1 : index + 1;
    if (target < 0 || target >= types.length) return;

    const orderedIds = types.map((t) => t.id);
    [orderedIds[index], orderedIds[target]] = [
      orderedIds[target],
      orderedIds[index],
    ];

    startTransition(async () => {
      await reorderTaskTypes(orderedIds);
      router.refresh();
    });
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button className="min-h-11 gap-2" render={<Link href="/tasks/settings/new" />}>
          <Plus className="size-4" />
          New task type
        </Button>
      </div>

      <div className="space-y-3">
        {types.map((type, index) => (
          <Card key={type.id}>
            <CardContent className="flex items-center gap-3 p-4">
              <div className="flex flex-col gap-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={pending || index === 0}
                  onClick={() => move(type.id, "up")}
                  aria-label="Move up"
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="size-8"
                  disabled={pending || index === types.length - 1}
                  onClick={() => move(type.id, "down")}
                  aria-label="Move down"
                >
                  <ArrowDown className="size-4" />
                </Button>
              </div>

              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-muted/50">
                <TaskTypeIconPreview iconName={type.iconName} />
              </div>

              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{type.label}</p>
                  <span className="font-mono text-xs text-muted-foreground">
                    {type.slug}
                  </span>
                  {!type.active && (
                    <Badge variant="outline" className="text-xs">
                      Inactive
                    </Badge>
                  )}
                  {type.showInQuickLog && (
                    <Badge variant="secondary" className="text-xs">
                      Quick-log
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  {type._count.tasks} task{type._count.tasks !== 1 ? "s" : ""}
                </p>
              </div>

              <Button
                variant="outline"
                size="icon"
                className="size-10 shrink-0"
                render={<Link href={`/tasks/settings/${type.id}/edit`} />}
                aria-label={`Edit ${type.label}`}
              >
                <Pencil className="size-4" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
