"use client";

import Link from "next/link";
import { Plus, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function EquipmentHubActions() {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="hidden sm:flex sm:items-center sm:gap-2">
        <Button
          variant="outline"
          className="min-h-11 gap-2"
          render={<Link href="/equipment?status=NEEDS_SERVICE" />}
        >
          <Wrench className="size-4" />
          Log maintenance
        </Button>
        <Button className="min-h-11 gap-2" render={<Link href="/equipment/new" />}>
          <Plus className="size-4" />
          Add equipment
        </Button>
      </div>
      <div className="sm:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button className="min-h-11 gap-2">
                <Plus className="size-4" />
                Add
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem render={<Link href="/equipment/new" />}>
              Add equipment
            </DropdownMenuItem>
            <DropdownMenuItem
              render={<Link href="/equipment?status=NEEDS_SERVICE" />}
            >
              Log maintenance
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
