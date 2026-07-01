import Link from "next/link";
import { Grape, ListTodo, Droplets } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardStats } from "@/domains/blocks/queries";

export default async function DashboardPage() {
  const stats = await getDashboardStats();

  const cards = [
    {
      title: "Vineyard blocks",
      value: stats.blockCount,
      description: "Active blocks in the estate",
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
      title: "Irrigation schedules",
      value: stats.upcomingIrrigation,
      description: "Active schedules",
      href: "/irrigation",
      icon: Droplets,
    },
  ];

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Operational overview for Cooper Estate Vineyards
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
          <Button render={<Link href="/blocks" />}>Browse blocks</Button>
          <Button variant="outline" render={<Link href="/map" />}>
            Open map
          </Button>
          <Button variant="outline" disabled>
            Log task (Sprint 2)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
