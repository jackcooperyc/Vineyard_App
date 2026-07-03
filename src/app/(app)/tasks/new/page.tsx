import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskForm } from "@/components/tasks/task-form";
import {
  getBlocksForTaskForm,
  getUsersForAssignment,
} from "@/domains/tasks/queries";
import { getActiveEquipmentForSelect } from "@/domains/equipment/queries";
import { getTaskTypes } from "@/domains/tasks/type-queries";

export default async function NewTaskPage({
  searchParams,
}: {
  searchParams: Promise<{ blockId?: string }>;
}) {
  const params = await searchParams;
  const [blocks, users, equipment, taskTypes] = await Promise.all([
    getBlocksForTaskForm(),
    getUsersForAssignment(),
    getActiveEquipmentForSelect(),
    getTaskTypes({ activeOnly: true }),
  ]);

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          render={<Link href="/tasks" aria-label="Back to tasks" />}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">New task</h2>
          <p className="text-sm text-muted-foreground">
            Assign vineyard work to a block
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Task details</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskForm
            blocks={blocks}
            users={users}
            equipment={equipment}
            taskTypes={taskTypes}
            defaultBlockId={params.blockId}
          />
        </CardContent>
      </Card>
    </div>
  );
}
