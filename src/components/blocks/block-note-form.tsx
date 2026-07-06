"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createBlockNote } from "@/domains/notes/actions";
import { showNoteCreatedToast } from "@/lib/submission-toast";

export function BlockNoteForm({
  blockId,
  blockLabel,
}: {
  blockId: string;
  blockLabel: string;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("blockId", blockId);

    startTransition(async () => {
      const result = await createBlockNote(formData);
      if (result.error) {
        setError(result.error);
        return;
      }
      showNoteCreatedToast(blockLabel);
      e.currentTarget.reset();
      router.refresh();
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 border-b pb-4">
      <div className="space-y-2">
        <Label htmlFor={`note-${blockId}`}>Add field note</Label>
        <Textarea
          id={`note-${blockId}`}
          name="content"
          rows={3}
          required
          className="text-base"
          placeholder="Observations from the block…"
        />
      </div>
      {error && (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      )}
      <Button type="submit" size="sm" className="min-h-10" disabled={pending}>
        {pending ? "Saving…" : "Log note"}
      </Button>
    </form>
  );
}
