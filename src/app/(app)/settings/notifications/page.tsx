import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NotificationPreferencesForm } from "@/components/settings/notification-preferences-form";
import { getNotificationPreferencesForUser } from "@/domains/notifications/preferences-queries";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function NotificationSettingsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }

  const preferences = await getNotificationPreferencesForUser(session.user.id);

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
          <h2 className="text-2xl font-semibold tracking-tight">
            Notification settings
          </h2>
          <p className="text-muted-foreground">
            Manage email alerts for task assignments, status changes, and due
            date reminders.
          </p>
        </div>
      </div>

      <NotificationPreferencesForm preferences={preferences} />
    </div>
  );
}
