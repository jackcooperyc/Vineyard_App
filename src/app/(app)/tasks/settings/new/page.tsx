import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TaskTypeForm } from "@/components/tasks/settings/task-type-form";

export default function NewTaskTypePage() {
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
          <h2 className="text-2xl font-semibold tracking-tight">New task type</h2>
          <p className="text-sm text-muted-foreground">
            Add a custom task type to the catalog
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Type settings</CardTitle>
        </CardHeader>
        <CardContent>
          <TaskTypeForm />
        </CardContent>
      </Card>
    </div>
  );
}
