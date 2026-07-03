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
import { DashboardWeatherCard } from "@/components/weather/dashboard-weather-card";
import { getDashboardStats } from "@/domains/blocks/queries";
import { getEnvironmentalThresholds } from "@/domains/environment/queries";
import { getEquipmentNeedingService } from "@/domains/equipment/queries";
import { getIrrigationAlerts } from "@/domains/irrigation/queries";
import { getUpcomingTasks } from "@/domains/tasks/queries";
import {
  getCurrentWeather,
  getWeatherForecast,
} from "@/domains/weather/queries";

export default async function DashboardPage() {
  const [
    stats,
    upcomingTasks,
    equipmentNeedingService,
    irrigationAlerts,
    currentWeather,
    weatherForecast,
    thresholds,
  ] = await Promise.all([
    getDashboardStats(),
    getUpcomingTasks(3),
    getEquipmentNeedingService(3),
    getIrrigationAlerts(),
    getCurrentWeather(),
    getWeatherForecast(),
    getEnvironmentalThresholds(),
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

      <DashboardWeatherCard
        current={currentWeather}
        forecast={weatherForecast}
        thresholds={thresholds}
      />

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
          <Button size="touch" variant="outline" render={<Link href="/equipment" />}>
            Equipment
          </Button>
          <Button
            size="touch"
            variant="outline"
            render={<Link href="/equipment?status=NEEDS_SERVICE" />}
          >
            Log service
          </Button>
          <Button
            size="touch"
            variant="outline"
            render={<Link href="/tasks?due=overdue" />}
          >
            Overdue tasks
          </Button>
          <Button
            size="touch"
            variant="outline"
            render={<Link href="/irrigation?view=alerts" />}
          >
            Irrigation alerts
          </Button>
          <Button
            size="touch"
            variant="outline"
            render={<Link href="/equipment?due=overdue" />}
          >
            Service overdue
          </Button>
          <Button size="touch" variant="outline" render={<Link href="/reports" />}>
            Reports
          </Button>
        </CardContent>
      </Card>

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
          {irrigationAlerts.length > 0 ? (
            irrigationAlerts.slice(0, 3).map((alert) => (
              <IrrigationAlertCard key={alert.scheduleId} alert={alert} />
            ))
          ) : (
            <div className="space-y-3 py-2 text-center">
              <p className="text-sm text-muted-foreground">
                No overdue irrigation — all blocks are on schedule.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-10"
                  render={<Link href="/irrigation/schedules/new" />}
                >
                  Create schedule
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-10"
                  render={<Link href="/irrigation/records/new" />}
                >
                  Log irrigation
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
          {equipmentNeedingService.length > 0 ? (
            equipmentNeedingService.map((item) => (
              <EquipmentListCard key={item.id} item={item} />
            ))
          ) : (
            <div className="space-y-3 py-2 text-center">
              <p className="text-sm text-muted-foreground">
                No equipment currently due for service.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-10"
                  render={<Link href="/equipment?status=NEEDS_SERVICE" />}
                >
                  Log service
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-10"
                  render={<Link href="/equipment/new" />}
                >
                  Add equipment
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

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
          {upcomingTasks.length > 0 ? (
            upcomingTasks.map((task) => (
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
            ))
          ) : (
            <div className="space-y-3 py-2 text-center">
              <p className="text-sm text-muted-foreground">
                No upcoming tasks with due dates.
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-10"
                  render={<Link href="/tasks/new" />}
                >
                  Create task
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="min-h-10"
                  render={<Link href="/field" />}
                >
                  Field log
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
