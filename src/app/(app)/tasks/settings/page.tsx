import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TaskTypeList } from "@/components/tasks/settings/task-type-list";
import { getTaskTypesForSettings } from "@/domains/tasks/type-queries";
import { hasPermission } from "@/lib/auth-session";
import { auth } from "@/lib/auth";
import { parseUserRole } from "@/lib/rbac";

export default async function TaskTypeSettingsPage() {
  const session = await auth();
  const role = parseUserRole(session?.user?.role);
  if (!hasPermission(role, "tasks:types")) {
    redirect("/tasks");
  }

  const types = await getTaskTypesForSettings();

  return (
    <div className="field-readable mx-auto max-w-3xl space-y-6 pb-4">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          render={<Link href="/tasks" aria-label="Back to tasks" />}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Task types</h2>
          <p className="text-muted-foreground">
            Configure labels, icons, quick-log visibility, and defaults.
          </p>
        </div>
      </div>

      <TaskTypeList types={types} />
    </div>
  );
}
