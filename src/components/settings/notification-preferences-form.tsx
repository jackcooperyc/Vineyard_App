"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateNotificationPreferences } from "@/domains/notifications/preferences-actions";
import {
  EVENT_DESCRIPTIONS,
  EVENT_LABELS,
} from "@/domains/notifications/constants";
import type { NotificationPreferenceFields } from "@/domains/notifications/types";
import type { TaskNotificationEventType } from "@/generated/prisma/client";

const TOGGLE_EVENTS: {
  name: keyof NotificationPreferenceFields;
  event: TaskNotificationEventType;
}[] = [
  { name: "emailAssigned", event: "ASSIGNED" },
  { name: "emailCreated", event: "CREATED" },
  { name: "emailCompleted", event: "COMPLETED" },
  { name: "emailInProgress", event: "IN_PROGRESS" },
  { name: "emailCancelled", event: "CANCELLED" },
  { name: "emailPaused", event: "PAUSED" },
  { name: "emailDueSoon", event: "DUE_SOON" },
  { name: "emailOverdue", event: "OVERDUE" },
];

export function NotificationPreferencesForm({
  preferences,
}: {
  preferences: NotificationPreferenceFields;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const result = await updateNotificationPreferences(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <section className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Email notifications</h3>
          <p className="text-sm text-muted-foreground">
            Choose which task events send email. In-app changes still apply
            when email is not configured.
          </p>
        </div>
        <ul className="divide-y rounded-lg border">
          {TOGGLE_EVENTS.map(({ name, event }) => (
            <li
              key={name}
              className="flex min-h-14 items-start gap-3 px-4 py-3"
            >
              <input
                id={name}
                name={name}
                type="checkbox"
                defaultChecked={preferences[name] as boolean}
                className="mt-1 size-4 rounded border-input"
              />
              <div className="flex-1">
                <Label htmlFor={name} className="font-medium">
                  {EVENT_LABELS[event]}
                </Label>
                <p className="text-sm text-muted-foreground">
                  {EVENT_DESCRIPTIONS[event]}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="dueSoonHours">Due soon window (hours)</Label>
          <Input
            id="dueSoonHours"
            name="dueSoonHours"
            type="number"
            min={1}
            max={168}
            defaultValue={preferences.dueSoonHours}
          />
          <p className="text-xs text-muted-foreground">
            Remind this many hours before the due date.
          </p>
        </div>
        <div className="space-y-2">
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            name="timezone"
            defaultValue={preferences.timezone}
            placeholder="America/Los_Angeles"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quietHoursStart">Quiet hours start (0–23)</Label>
          <Input
            id="quietHoursStart"
            name="quietHoursStart"
            type="number"
            min={0}
            max={23}
            defaultValue={preferences.quietHoursStart ?? ""}
            placeholder="Optional"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="quietHoursEnd">Quiet hours end (0–23)</Label>
          <Input
            id="quietHoursEnd"
            name="quietHoursEnd"
            type="number"
            min={0}
            max={23}
            defaultValue={preferences.quietHoursEnd ?? ""}
            placeholder="Optional"
          />
        </div>
      </section>

      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      {saved && (
        <p className="text-sm text-emerald-700" role="status">
          Preferences saved.
        </p>
      )}

      <Button type="submit" disabled={pending} className="min-h-11">
        {pending ? "Saving…" : "Save preferences"}
      </Button>
    </form>
  );
}
