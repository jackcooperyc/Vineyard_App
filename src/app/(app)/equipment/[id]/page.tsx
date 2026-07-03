import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Hash, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { EquipmentStatusActions } from "@/components/equipment/equipment-status-actions";
import {
  EquipmentStatusBadge,
  ServiceDueBadge,
} from "@/components/equipment/equipment-status-badge";
import { EquipmentTypeIcon } from "@/components/equipment/equipment-type-icon";
import { EquipmentPhoto } from "@/components/equipment/equipment-photo";
import { MaintenanceRecordForm } from "@/components/equipment/maintenance-record-form";
import { MaintenanceRecordItem } from "@/components/equipment/maintenance-record-item";
import { EquipmentRecentlyDeletedMaintenance } from "@/components/equipment/equipment-recently-deleted-maintenance";
import { DeleteEquipmentDialog } from "@/components/equipment/delete-equipment-dialog";
import { RetireEquipmentDialog } from "@/components/equipment/retire-equipment-dialog";
import { TaskListCard } from "@/components/tasks/task-list-card";
import { getEquipmentById } from "@/domains/equipment/queries";
import { getRecentlyDeletedMaintenanceRecords } from "@/domains/soft-delete/queries";
import {
  buildEquipmentHubHref,
  decodeBackParams,
  encodeBackParams,
} from "@/lib/hub-back-href";

export default async function EquipmentDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const backParams = decodeBackParams(sp);
  const backHref = buildEquipmentHubHref(backParams);
  const editHref = `/equipment/${id}/edit${encodeBackParams(backParams)}`;
  const equipment = await getEquipmentById(id);

  if (!equipment) {
    notFound();
  }

  const deletedMaintenance = await getRecentlyDeletedMaintenanceRecords(id);

  return (
    <div className="field-readable mx-auto max-w-3xl space-y-6">
      <EquipmentPhoto
        photoUrl={equipment.photoUrl}
        name={equipment.name}
        type={equipment.type}
        className="aspect-[16/9] w-full rounded-xl"
        iconClassName="size-12"
      />

      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          render={<Link href={backHref} aria-label="Back to equipment" />}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
              <EquipmentTypeIcon type={equipment.type} className="size-3.5" />
              {equipment.type}
            </span>
            <EquipmentStatusBadge status={equipment.status} />
            <ServiceDueBadge nextServiceAt={equipment.nextServiceAt} />
          </div>
          <h2 className="text-2xl font-semibold tracking-tight">{equipment.name}</h2>
          {equipment.serialNumber && (
            <p className="flex items-center gap-1 text-sm text-muted-foreground">
              <Hash className="size-3.5" />
              {equipment.serialNumber}
            </p>
          )}
        </div>
      </div>

      <EquipmentStatusActions equipmentId={equipment.id} status={equipment.status} />

      <div className="flex flex-wrap gap-2">
        <Button
          variant="outline"
          className="min-h-11 gap-2"
          render={<Link href={editHref} />}
        >
          <Pencil className="size-4" />
          Edit equipment
        </Button>
        {equipment.status !== "RETIRED" && (
          <RetireEquipmentDialog
            equipmentId={equipment.id}
            equipmentName={equipment.name}
          />
        )}
        <DeleteEquipmentDialog
          equipmentId={equipment.id}
          equipmentName={equipment.name}
          backParams={backParams}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Service schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <div>
                <dt className="text-muted-foreground">Last serviced</dt>
                <dd className="font-medium">
                  {equipment.lastServicedAt
                    ? equipment.lastServicedAt.toLocaleDateString()
                    : "Not recorded"}
                </dd>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="size-4 text-muted-foreground" />
              <div>
                <dt className="text-muted-foreground">Next service due</dt>
                <dd className="font-medium">
                  {equipment.nextServiceAt
                    ? equipment.nextServiceAt.toLocaleDateString()
                    : "Not scheduled"}
                </dd>
              </div>
            </div>
          </dl>
          {equipment.notes && (
            <p className="mt-4 text-sm whitespace-pre-wrap text-muted-foreground">
              {equipment.notes}
            </p>
          )}
        </CardContent>
      </Card>

      <Card id="maintenance">
        <CardHeader>
          <CardTitle>Log maintenance</CardTitle>
          <CardDescription>
            Record service work and update the next due date
          </CardDescription>
        </CardHeader>
        <CardContent>
          <MaintenanceRecordForm equipmentId={equipment.id} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Maintenance history</CardTitle>
          <CardDescription>
            {equipment._count.maintenanceRecords} record
            {equipment._count.maintenanceRecords !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {equipment.maintenanceRecords.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No maintenance logged yet.{" "}
              <a href="#maintenance" className="text-primary underline-offset-4 hover:underline">
                Log the first service
              </a>
            </p>
          ) : (
            <div className="space-y-3">
              {equipment.maintenanceRecords.map((record) => (
                <MaintenanceRecordItem
                  key={record.id}
                  record={record}
                  equipmentId={equipment.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <EquipmentRecentlyDeletedMaintenance
        items={deletedMaintenance}
        equipmentId={equipment.id}
      />

      <Card>
        <CardHeader>
          <CardTitle>Open tasks</CardTitle>
          <CardDescription>
            Work using this equipment · {equipment._count.tasks} total assignments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {equipment.tasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No open tasks linked to this equipment.
            </p>
          ) : (
            equipment.tasks.map((task) => (
              <TaskListCard
                key={task.id}
                task={{
                  id: task.id,
                  title: task.title,
                  taskType: task.taskType,
                  status: task.status,
                  dueDate: task.dueDate,
                  completedAt: task.completedAt,
                  block: task.block,
                  assignedTo: null,
                }}
              />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
