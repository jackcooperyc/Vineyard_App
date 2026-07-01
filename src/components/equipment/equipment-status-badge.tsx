import type { EquipmentStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { EQUIPMENT_STATUS_LABELS } from "@/domains/equipment/constants";
import { cn } from "@/lib/utils";

const statusConfig: Record<EquipmentStatus, { className: string }> = {
  ACTIVE: {
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  IN_MAINTENANCE: {
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  RETIRED: {
    className: "bg-muted text-muted-foreground border-border",
  },
};

export function EquipmentStatusBadge({
  status,
  className,
}: {
  status: EquipmentStatus;
  className?: string;
}) {
  return (
    <Badge variant="outline" className={cn(statusConfig[status].className, className)}>
      {EQUIPMENT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function ServiceDueBadge({
  nextServiceAt,
  className,
}: {
  nextServiceAt: Date | null;
  className?: string;
}) {
  if (!nextServiceAt) return null;

  const now = new Date();
  const overdue = nextServiceAt <= now;

  return (
    <Badge
      variant="outline"
      className={cn(
        overdue
          ? "bg-red-100 text-red-800 border-red-200"
          : "bg-blue-100 text-blue-800 border-blue-200",
        className,
      )}
    >
      {overdue ? "Service overdue" : `Service due ${nextServiceAt.toLocaleDateString()}`}
    </Badge>
  );
}
