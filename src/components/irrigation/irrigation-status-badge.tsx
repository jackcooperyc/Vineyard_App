import type { IrrigationStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { IRRIGATION_STATUS_LABELS } from "@/domains/irrigation/constants";
import { cn } from "@/lib/utils";

const statusConfig: Record<IrrigationStatus, { className: string }> = {
  SCHEDULED: {
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
  APPLIED: {
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  MISSED: {
    className: "bg-red-100 text-red-800 border-red-200",
  },
  SKIPPED: {
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function IrrigationStatusBadge({
  status,
  className,
}: {
  status: IrrigationStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(statusConfig[status].className, className)}>
      {IRRIGATION_STATUS_LABELS[status]}
    </Badge>
  );
}
