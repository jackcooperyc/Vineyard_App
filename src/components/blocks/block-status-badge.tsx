import type { BlockStatus } from "@/generated/prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const statusConfig: Record<
  BlockStatus,
  { label: string; className: string }
> = {
  ACTIVE: {
    label: "Active",
    className: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  FALLOW: {
    label: "Fallow",
    className: "bg-amber-100 text-amber-800 border-amber-200",
  },
  REPLANTING: {
    label: "Replanting",
    className: "bg-blue-100 text-blue-800 border-blue-200",
  },
};

export function BlockStatusBadge({
  status,
  className,
}: {
  status: BlockStatus;
  className?: string;
}) {
  const config = statusConfig[status];
  return (
    <Badge variant="outline" className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
