import Link from "next/link";
import { Grape, ListTodo, Droplets, Tractor, Map, ClipboardPen } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EquipmentListCard } from "@/components/equipment/equipment-list-card";
import { IrrigationAlertCard } from "@/components/irrigation/irrigation-alert-card";
import { TaskListCard } from "@/components/tasks/task-list-card";
import { getDashboardStats } from "@/domains/blocks/queries";
import { getEquipmentNeedingService } from "@/domains/equipment/queries";
import { getIrrigationAlerts } from "@/domains/irrigation/queries";
import { getUpcomingTasks } from "@/domains/tasks/queries";

export default async function DashboardPage() {
  const [stats, upcomingTasks, equipmentNeedingService, irrigationAlerts] =
    await Promise.all([
    getDashboardStats(),
    getUpcomingTasks(3),
    getEquipmentNeedingService(3),
    getIrrigationAlerts(),
  ]);

  const cards = [
    {
      title: "Vineyard blocks",
      value: stats.vineyardBlockCount,
      description: `${stats.blockCount} total areas incl. infrastructure`,
      href: "/blocks",
      icon: Grape,
    },
    {
      title: "Pending tasks",
      value: stats.pendingTasks,
      description: "Open work items",
      href: "/tasks",
      icon: ListTodo,
    },
    {
      title: "Service due",
      value: stats.equipmentNeedingService,
      description: "Equipment needing maintenance",
      href: "/equipment?status=NEEDS_SERVICE",
      icon: Tractor,
    },
    {
      title: "Irrigation alerts",
      value: stats.irrigationAlerts,
      description: "Overdue block irrigation",
      href: "/irrigation?view=alerts",
      icon: Droplets,
    },
  ];

  return (
    <div className="field-readable mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Operational overview for Cooper Estate Vineyards
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:hidden">
        <Button size="touch" className="h-auto flex-col gap-2 py-4" render={<Link href="/field" />}>
          <ClipboardPen className="size-6" />
          Field log
        </Button>
        <Button
          size="touch"
          variant="outline"
          className="h-auto flex-col gap-2 py-4"
          render={<Link href="/map" />}
        >
          <Map className="size-6" />
          Open map
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <Card key={card.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  {card.title}
                </CardTitle>
                <Icon className="size-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{card.value}</p>
                <CardDescription className="mt-1">
                  {card.description}
                </CardDescription>
                <Button
                  variant="link"
                  className="mt-3 h-auto p-0"
                  render={<Link href={card.href} />}
                >
                  View →
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick links</CardTitle>
          <CardDescription>Jump to common field workflows</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button size="touch" render={<Link href="/field" />}>
            Field log
          </Button>
          <Button size="touch" variant="outline" render={<Link href="/blocks" />}>
            Browse blocks
          </Button>
          <Button size="touch" variant="outline" render={<Link href="/map" />}>
            Open map
          </Button>
          <Button size="touch" variant="outline" render={<Link href="/tasks/new" />}>
            Full task form
          </Button>
        </CardContent>
      </Card>

      {irrigationAlerts.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Irrigation alerts</CardTitle>
              <CardDescription>Blocks past their irrigation window</CardDescription>
            </div>
            <Button
              variant="link"
              className="h-auto p-0"
              render={<Link href="/irrigation?view=alerts" />}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {irrigationAlerts.slice(0, 3).map((alert) => (
              <IrrigationAlertCard key={alert.scheduleId} alert={alert} />
            ))}
          </CardContent>
        </Card>
      )}

      {equipmentNeedingService.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Equipment needing service</CardTitle>
              <CardDescription>Overdue or upcoming maintenance</CardDescription>
            </div>
            <Button
              variant="link"
              className="h-auto p-0"
              render={<Link href="/equipment?status=NEEDS_SERVICE" />}
            >
              View all
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {equipmentNeedingService.map((item) => (
              <EquipmentListCard key={item.id} item={item} />
            ))}
          </CardContent>
        </Card>
      )}

      {upcomingTasks.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upcoming tasks</CardTitle>
              <CardDescription>Next due dates across the estate</CardDescription>
            </div>
            <Button variant="link" className="h-auto p-0" render={<Link href="/tasks" />}>
              View all
            </Button>
          </CardHeader>
          <CardContent className="space-y-3">
            {upcomingTasks.map((task) => (
              <TaskListCard
                key={task.id}
                task={{
                  id: task.id,
                  title: task.title,
                  type: task.type,
                  status: task.status,
                  dueDate: task.dueDate,
                  completedAt: task.completedAt,
                  block: {
                    id: task.block.id,
                    code: task.block.code,
                    name: task.block.name,
                  },
                  assignedTo: null,
                }}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
