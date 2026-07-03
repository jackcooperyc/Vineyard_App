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
import { EquipmentExportButton } from "@/components/equipment/equipment-export-button";
import { EquipmentHubQuickLogSheet } from "@/components/equipment/equipment-hub-quick-log-sheet";
import type { EquipmentListItem } from "@/domains/equipment/queries";

type EquipmentOption = { id: string; name: string; type: string };

export function EquipmentHubActions({
  equipment = [],
  exportItems = [],
}: {
  equipment?: EquipmentOption[];
  exportItems?: Pick<
    EquipmentListItem,
    | "name"
    | "type"
    | "status"
    | "serialNumber"
    | "lastServicedAt"
    | "nextServiceAt"
  >[];
}) {
  return (
    <div className="flex shrink-0 items-center gap-2">
      <div className="hidden sm:flex sm:items-center sm:gap-2">
        {exportItems.length > 0 && (
          <EquipmentExportButton items={exportItems} label="Export visible" />
        )}
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
