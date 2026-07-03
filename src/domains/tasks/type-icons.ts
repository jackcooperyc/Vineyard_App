import {
  Grape,
  ListTodo,
  Scissors,
  Search,
  SprayCan,
  Wrench,
  Tractor,
  Droplets,
  ClipboardList,
  Shovel,
  Hammer,
  Leaf,
  Sun,
  CloudRain,
  type LucideIcon,
} from "lucide-react";

export const TASK_TYPE_ICON_OPTIONS = [
  { name: "Scissors", icon: Scissors, label: "Scissors" },
  { name: "SprayCan", icon: SprayCan, label: "Spray" },
  { name: "Grape", icon: Grape, label: "Grape" },
  { name: "Search", icon: Search, label: "Search" },
  { name: "ListTodo", icon: ListTodo, label: "List" },
  { name: "Wrench", icon: Wrench, label: "Wrench" },
  { name: "Tractor", icon: Tractor, label: "Tractor" },
  { name: "Droplets", icon: Droplets, label: "Water" },
  { name: "ClipboardList", icon: ClipboardList, label: "Clipboard" },
  { name: "Shovel", icon: Shovel, label: "Shovel" },
  { name: "Hammer", icon: Hammer, label: "Hammer" },
  { name: "Leaf", icon: Leaf, label: "Leaf" },
  { name: "Sun", icon: Sun, label: "Sun" },
  { name: "CloudRain", icon: CloudRain, label: "Weather" },
] as const;

const iconMap: Record<string, LucideIcon> = Object.fromEntries(
  TASK_TYPE_ICON_OPTIONS.map((o) => [o.name, o.icon]),
);

export function resolveTaskTypeIcon(iconName: string): LucideIcon {
  return iconMap[iconName] ?? ListTodo;
}

export function isAllowedTaskTypeIcon(iconName: string): boolean {
  return iconName in iconMap;
}
