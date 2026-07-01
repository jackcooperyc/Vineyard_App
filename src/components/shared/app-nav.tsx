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
  { href: "/equipment", label: "Equipment", icon: Tractor },
  { href: "/irrigation", label: "Irrigation", icon: Droplets },
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

export function BottomNav() {
  const pathname = usePathname();

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
                  className="flex min-h-16 w-full flex-col items-center justify-center gap-1 rounded-none px-1 text-[11px] font-semibold text-muted-foreground touch-manipulation"
                />
              }
            >
              <span className="flex size-10 items-center justify-center">
                <MoreHorizontal className="size-5" />
              </span>
              <span>More</span>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="mb-2 min-w-44">
              {moreNav.map((item) => {
                const Icon = item.icon;
                return (
                  <DropdownMenuItem
                    key={item.href}
                    render={<Link href={item.href} className="min-h-11" />}
                  >
                    <Icon className="size-5" />
                    {item.label}
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
