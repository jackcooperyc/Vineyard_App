import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm } from "@/components/users/user-form";
import { UserRoleBadge } from "@/components/users/user-role-badge";
import { UserRoleSelect } from "@/components/users/user-role-select";
import { getUsers } from "@/domains/users/queries";
import { requirePermission } from "@/lib/auth-session";

export default async function UsersSettingsPage() {
  const session = await requirePermission("users:manage");
  if ("error" in session) {
    redirect("/dashboard");
  }

  const users = await getUsers();

  return (
    <div className="field-readable mx-auto max-w-3xl space-y-6 pb-4">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          render={<Link href="/dashboard" aria-label="Back to dashboard" />}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="space-y-1">
          <h2 className="text-2xl font-semibold tracking-tight">Team users</h2>
          <p className="text-muted-foreground">
            Create accounts for managers and field crew. Share the temporary password once at creation.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Add user</CardTitle>
        </CardHeader>
        <CardContent>
          <UserForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Current users</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex flex-col gap-3 border-b pb-4 last:border-0 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="space-y-1">
                <p className="font-medium">{user.name ?? user.email}</p>
                <p className="text-sm text-muted-foreground">{user.email}</p>
              </div>
              <div className="flex items-center gap-2">
                <UserRoleBadge role={user.role} />
                <UserRoleSelect
                  userId={user.id}
                  currentRole={user.role}
                  disabled={user.id === session.user.id}
                />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
