"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { EquipmentHubQuickLogSheet } from "@/components/equipment/equipment-hub-quick-log-sheet";

type EquipmentOption = { id: string; name: string; type: string };

export function EquipmentHubActions({
  equipment = [],
}: {
  equipment?: EquipmentOption[];
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="hidden sm:flex sm:items-center sm:gap-2">
        <EquipmentHubQuickLogSheet equipment={equipment} />
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
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
