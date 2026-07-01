type EquipmentOption = { id: string; name: string; type: string };

export function EquipmentSelectField({
  equipment,
  id = "equipmentId",
  name = "equipmentId",
  className,
  defaultValue,
}: {
  equipment: EquipmentOption[];
  id?: string;
  name?: string;
  className?: string;
  defaultValue?: string;
}) {
  if (equipment.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No equipment on file.{" "}
        <a href="/equipment/new" className="text-primary underline-offset-4 hover:underline">
          Add equipment
        </a>
      </p>
    );
  }

  return (
    <select
      id={id}
      name={name}
      defaultValue={defaultValue ?? ""}
      className={
        className ??
        "flex h-12 w-full rounded-lg border border-input bg-background px-3 text-base"
      }
    >
      <option value="">None</option>
      {equipment.map((item) => (
        <option key={item.id} value={item.id}>
          {item.name} ({item.type})
        </option>
      ))}
    </select>
  );
}
