import { Badge } from "@/components/ui/badge";
import type { UserRole } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

const ROLE_LABELS: Record<UserRole, string> = {
  OWNER: "Owner",
  MANAGER: "Manager",
  FIELD_WORKER: "Field worker",
  READ_ONLY: "Read only",
};

export function UserRoleBadge({
  role,
  className,
}: {
  role: UserRole;
  className?: string;
}) {
  return (
    <Badge
      variant="outline"
      className={cn(
        role === "OWNER" && "border-violet-300 bg-violet-50 text-violet-900",
        role === "MANAGER" && "border-blue-300 bg-blue-50 text-blue-900",
        role === "FIELD_WORKER" && "border-emerald-300 bg-emerald-50 text-emerald-900",
        role === "READ_ONLY" && "border-muted-foreground/30 bg-muted text-muted-foreground",
        className,
      )}
    >
      {ROLE_LABELS[role]}
    </Badge>
  );
}
