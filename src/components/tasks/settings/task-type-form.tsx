"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTaskType, updateTaskType } from "@/domains/tasks/type-actions";
import { slugFromLabel } from "@/domains/tasks/constants";
import { TaskTypeIconPicker } from "@/components/tasks/settings/task-type-icon-picker";

type TaskTypeFormValues = {
  id?: string;
  label: string;
  slug: string;
  iconName: string;
  colorHex: string | null;
  showInQuickLog: boolean;
  defaultTitleTemplate: string | null;
  defaultDueDaysOffset: number | null;
  active: boolean;
};

export function TaskTypeForm({
  taskType,
}: {
  taskType?: TaskTypeFormValues;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const isEdit = Boolean(taskType?.id);
  const [label, setLabel] = useState(taskType?.label ?? "");
  const [slug, setSlug] = useState(taskType?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(isEdit);
  const [iconName, setIconName] = useState(taskType?.iconName ?? "ListTodo");

  function handleLabelChange(value: string) {
    setLabel(value);
    if (!slugTouched) {
      setSlug(slugFromLabel(value));
    }
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("iconName", iconName);
    if (isEdit && taskType?.id) {
      formData.set("taskTypeId", taskType.id);
    }

    startTransition(async () => {
      const result = isEdit
        ? await updateTaskType(formData)
        : await createTaskType(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      router.push("/tasks/settings");
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="label">Label</Label>
        <Input
          id="label"
          name="label"
          required
          className="h-12 text-base"
          value={label}
          onChange={(e) => handleLabelChange(e.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          name="slug"
          required
          className="h-12 font-mono text-base"
          value={slug}
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value.toUpperCase());
          }}
          pattern="[A-Z][A-Z0-9_]*"
        />
        <p className="text-xs text-muted-foreground">
          Uppercase snake_case — stable key used in URLs and filters.
        </p>
      </div>

      <div className="space-y-2">
        <Label>Icon</Label>
        <TaskTypeIconPicker value={iconName} onChange={setIconName} />
        <input type="hidden" name="iconName" value={iconName} />
      </div>

      <div className="space-y-2">
        <Label htmlFor="colorHex">Color (optional)</Label>
        <Input
          id="colorHex"
          name="colorHex"
          type="color"
          className="h-12 w-24"
          defaultValue={taskType?.colorHex ?? "#6b7280"}
        />
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input type="hidden" name="showInQuickLog" value="false" />
        <input
          type="checkbox"
          name="showInQuickLog"
          value="true"
          defaultChecked={taskType?.showInQuickLog ?? true}
          className="size-4"
        />
        Show in Field log / quick-log
      </label>

      <div className="space-y-2">
        <Label htmlFor="defaultTitleTemplate">Default title template</Label>
        <Input
          id="defaultTitleTemplate"
          name="defaultTitleTemplate"
          className="h-12 text-base"
          placeholder="{{label}} — {{blockCode}}"
          defaultValue={taskType?.defaultTitleTemplate ?? ""}
        />
        <p className="text-xs text-muted-foreground">
          Use {"{{label}}"} and {"{{blockCode}}"} placeholders.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="defaultDueDaysOffset">Default due date offset (days)</Label>
        <Input
          id="defaultDueDaysOffset"
          name="defaultDueDaysOffset"
          type="number"
          min={0}
          max={365}
          className="h-12 text-base"
          defaultValue={taskType?.defaultDueDaysOffset ?? ""}
        />
      </div>

      <label className="flex items-center gap-3 text-sm">
        <input type="hidden" name="active" value="false" />
        <input
          type="checkbox"
          name="active"
          value="true"
          defaultChecked={taskType?.active ?? true}
          className="size-4"
        />
        Active
      </label>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}

      <div className="flex gap-3">
        <Button type="submit" className="min-h-11 flex-1" disabled={pending}>
          {pending ? "Saving…" : isEdit ? "Save changes" : "Create task type"}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="min-h-11"
          render={<Link href="/tasks/settings" />}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}
