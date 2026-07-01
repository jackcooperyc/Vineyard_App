import { cn } from "@/lib/utils";

export function MapLegend({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-3 left-3 z-10 rounded-lg border bg-background/90 px-3 py-2 text-xs shadow-sm backdrop-blur-sm",
        className,
      )}
    >
      <p className="mb-1.5 font-medium text-foreground">Block status</p>
      <ul className="space-y-1 text-muted-foreground">
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-emerald-500/70 ring-1 ring-emerald-700" />
          Normal
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-amber-500/70 ring-1 ring-amber-700" />
          Open tasks
        </li>
        <li className="flex items-center gap-2">
          <span className="size-3 rounded-sm bg-blue-500/70 ring-1 ring-blue-700" />
          Irrigation overdue
        </li>
      </ul>
    </div>
  );
}
