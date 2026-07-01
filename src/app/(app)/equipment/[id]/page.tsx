import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Calendar, Hash } from "lucide-react";
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
import { MaintenanceRecordForm } from "@/components/equipment/maintenance-record-form";
import { TaskListCard } from "@/components/tasks/task-list-card";
import { getEquipmentById } from "@/domains/equipment/queries";

export default async function EquipmentDetailPage({
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
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="mt-0.5 shrink-0"
          render={<Link href="/equipment" aria-label="Back to equipment" />}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-muted-foreground">
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

      <Card>
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
            <p className="text-sm text-muted-foreground">No maintenance logged yet.</p>
          ) : (
            equipment.maintenanceRecords.map((record) => (
              <div
                key={record.id}
                className="space-y-1 border-b pb-4 last:border-0 last:pb-0"
              >
                <p className="font-medium">
                  {record.description ?? "Maintenance service"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {record.performedAt.toLocaleDateString()}
                </p>
                {record.notes && (
                  <p className="text-sm text-muted-foreground">{record.notes}</p>
                )}
              </div>
            ))
          )}
        </CardContent>
      </Card>

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
                  type: task.type,
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
