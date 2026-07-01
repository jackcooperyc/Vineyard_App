import {
  Car,
  Droplets,
  Leaf,
  Scissors,
  Tractor,
  Wheat,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { EquipmentType } from "@/domains/equipment/constants";

const typeIcons: Record<EquipmentType, LucideIcon> = {
  Tractor: Tractor,
  Sprayer: Droplets,
  Harvester: Wheat,
  ATV: Car,
  Pump: Droplets,
  Mower: Scissors,
  Other: Wrench,
};

export function EquipmentTypeIcon({
  type,
  className,
}: {
  type: string;
  className?: string;
}) {
  const Icon = typeIcons[type as EquipmentType] ?? Leaf;
  return <Icon className={className} />;
}
