import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskTypeForm } from "@/components/tasks/settings/task-type-form";
import { getTaskTypeById } from "@/domains/tasks/type-queries";

export default async function EditTaskTypePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const taskType = await getTaskTypeById(id);

  if (!taskType) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          render={<Link href="/tasks/settings" aria-label="Back to task types" />}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Edit task type</h2>
          <p className="text-sm text-muted-foreground">{taskType.label}</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Type settings</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskTypeForm
            taskType={{
              id: taskType.id,
              label: taskType.label,
              slug: taskType.slug,
              iconName: taskType.iconName,
              colorHex: taskType.colorHex,
              showInQuickLog: taskType.showInQuickLog,
              defaultTitleTemplate: taskType.defaultTitleTemplate,
              defaultDueDaysOffset: taskType.defaultDueDaysOffset,
              active: taskType.active,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
