import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EquipmentForm } from "@/components/equipment/equipment-form";
import { getEquipmentById } from "@/domains/equipment/queries";
import type { EquipmentStatus } from "@/generated/prisma/client";

export default async function EditEquipmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const equipment = await getEquipmentById(id);

  if (!equipment) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          render={
            <Link href={`/equipment/${equipment.id}`} aria-label="Back to equipment" />
          }
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Edit equipment</h2>
          <p className="text-sm text-muted-foreground">
            {equipment.type} · {equipment.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Equipment details</CardTitle>
        </CardHeader>
        <CardContent>
          <EquipmentForm
            equipment={{
              id: equipment.id,
              name: equipment.name,
              type: equipment.type,
              status: equipment.status as EquipmentStatus,
              serialNumber: equipment.serialNumber,
              lastServicedAt: equipment.lastServicedAt,
              nextServiceAt: equipment.nextServiceAt,
              notes: equipment.notes,
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
