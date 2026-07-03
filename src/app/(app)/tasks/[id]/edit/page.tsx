import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskForm } from "@/components/tasks/task-form";
import {
  getBlocksForTaskForm,
  getTaskById,
  getUsersForAssignment,
} from "@/domains/tasks/queries";
import { getActiveEquipmentForSelect } from "@/domains/equipment/queries";
import type { TaskType } from "@/generated/prisma/client";
import { decodeBackParams, encodeBackParams } from "@/lib/hub-back-href";

export default async function EditTaskPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const backQuery = encodeBackParams(decodeBackParams(sp));
  const [task, blocks, users, equipment] = await Promise.all([
    getTaskById(id),
    getBlocksForTaskForm(),
    getUsersForAssignment(),
    getActiveEquipmentForSelect(),
  ]);

  if (!task) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          render={
            <Link
              href={`/tasks/${task.id}${backQuery}`}
              aria-label="Back to task"
            />
          }
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Edit task</h2>
          <p className="text-sm text-muted-foreground">{task.title}</p>
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
            task={{
              id: task.id,
              blockId: task.blockId,
              type: task.type as TaskType,
              title: task.title,
              description: task.description,
              dueDate: task.dueDate,
              assignedToId: task.assignedToId,
              equipmentId: task.equipmentId,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
