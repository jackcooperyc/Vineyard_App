import { EquipmentTypeIcon } from "@/components/equipment/equipment-type-icon";
import { cn } from "@/lib/utils";

type EquipmentPhotoProps = {
  photoUrl: string | null | undefined;
  name: string;
  type: string;
  className?: string;
  iconClassName?: string;
};

export function EquipmentPhoto({
  photoUrl,
  name,
  type,
  className,
  iconClassName,
}: EquipmentPhotoProps) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        className={cn("object-cover", className)}
      />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center justify-center bg-muted",
        className,
      )}
      aria-hidden
    >
      <EquipmentTypeIcon type={type} className={cn("text-muted-foreground", iconClassName)} />
    </div>
  );
}
