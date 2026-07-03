"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Grape,
  Map,
  ListTodo,
  Tractor,
  Droplets,
  ClipboardPen,
  MoreHorizontal,
  FileSpreadsheet,
  Gauge,
  Bell,
  Palette,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const mainNav = [
  { href: "/map", label: "Map", icon: Map },
  { href: "/field", label: "Field", icon: ClipboardPen },
  { href: "/tasks", label: "Tasks", icon: ListTodo },
  { href: "/blocks", label: "Blocks", icon: Grape },
];

const moreNav = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/reports", label: "Reports", icon: FileSpreadsheet },
  {
    href: "/equipment",
    label: "Equipment",
    icon: Tractor,
    badgeKey: "equipment" as const,
  },
  {
    href: "/irrigation",
    label: "Irrigation",
    icon: Droplets,
    badgeKey: "irrigation" as const,
  },
  { href: "/pumps", label: "Pumps", icon: Gauge },
  { href: "/settings/varieties", label: "Variety colors", icon: Palette },
  { href: "/settings/notifications", label: "Notifications", icon: Bell },
];

const allNav = [...moreNav.slice(0, 1), ...mainNav, ...moreNav.slice(1)];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex md:w-56 md:flex-col md:border-r md:bg-sidebar md:px-3 md:py-6">
      <div className="mb-8 px-3">
        <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Cooper Estate
        </p>
        <p className="text-sm font-semibold">Vineyard Ops</p>
      </div>
      <ul className="flex flex-1 flex-col gap-1">
        {allNav.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors",
                  active
                    ? "bg-sidebar-accent text-sidebar-accent-foreground"
                    : "text-sidebar-foreground hover:bg-sidebar-accent/60",
                )}
              >
                <Icon className="size-5 shrink-0" />
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export function BottomNav({
  alertCount = 0,
  equipmentServiceCount = 0,
  irrigationAlertCount = 0,
}: {
  alertCount?: number;
  equipmentServiceCount?: number;
  irrigationAlertCount?: number;
}) {
  const pathname = usePathname();
  const showBadge = alertCount > 0;

  const itemBadge = (key: "equipment" | "irrigation") => {
    const count =
      key === "equipment" ? equipmentServiceCount : irrigationAlertCount;
    if (count <= 0) return null;
    return (
      <span className="ml-auto flex size-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
        {count > 9 ? "9+" : count}
      </span>
    );
  };

  const moreActive = moreNav.some(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`),
  );

  return (
    <nav className="safe-bottom fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
      <ul className="grid grid-cols-5">
        {mainNav.map((item) => {
          const Icon = item.icon;
          const active =
            pathname === item.href || pathname.startsWith(`${item.href}/`);
          const isField = item.href === "/field";
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex min-h-16 flex-col items-center justify-center gap-1 px-1 touch-manipulation",
                  active ? "text-primary" : "text-muted-foreground",
                  isField && !active && "text-foreground",
                )}
              >
                <span
                  className={cn(
                    "flex size-10 items-center justify-center rounded-full",
                    isField &&
                      (active
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary"),
                  )}
                >
                  <Icon className="size-5" />
                </span>
                <span className="text-[11px] font-semibold">{item.label}</span>
              </Link>
            </li>
          );
        })}
        <li>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  className={cn(
                    "flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-none px-1 text-[11px] font-semibold touch-manipulation",
                    moreActive ? "text-primary" : "text-muted-foreground",
                  )}
                />
              }
            >
              <span className="relative flex size-10 items-center justify-center">
                <MoreHorizontal className="size-5" />
                {showBadge && (
                  <span
                    className="absolute -right-0.5 -top-0.5 flex size-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] font-bold leading-none text-destructive-foreground ring-2 ring-background"
                    aria-label={`${alertCount} alert${alertCount === 1 ? "" : "s"}`}
                  >
                    {alertCount > 9 ? "9+" : alertCount}
                  </span>
                )}
              </span>
              <span>More</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="mb-2 min-w-48">
              {moreNav.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  pathname.startsWith(`${item.href}/`);
                return (
                  <DropdownMenuItem
                    key={item.href}
                    render={<Link href={item.href} className="min-h-11" />}
                    className={cn(active && "bg-accent")}
                  >
                    <Icon className="size-5" />
                    <span className="flex-1">{item.label}</span>
                    {"badgeKey" in item && item.badgeKey
                      ? itemBadge(item.badgeKey)
                      : null}
                  </DropdownMenuItem>
                );
              })}
            </DropdownMenuContent>
          </DropdownMenu>
        </li>
      </ul>
    </nav>
  );
}
