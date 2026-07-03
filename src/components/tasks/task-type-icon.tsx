import { createElement } from "react";
import { resolveTaskTypeIcon } from "@/domains/tasks/type-icons";
import { cn } from "@/lib/utils";

export function TaskTypeIcon({
  iconName,
  className,
  style,
}: {
  iconName: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  return createElement(resolveTaskTypeIcon(iconName), {
    className: cn("size-4 shrink-0", className),
    style,
    "aria-hidden": true,
  });
}
