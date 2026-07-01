import Link from "next/link";
import { Suspense } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  EquipmentFilterBar,
  parseEquipmentStatusFilter,
} from "@/components/equipment/equipment-filter-bar";
import { EquipmentListCard } from "@/components/equipment/equipment-list-card";
import { getEquipment } from "@/domains/equipment/queries";

export default async function EquipmentPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const params = await searchParams;
  const statusFilter = parseEquipmentStatusFilter(params.status);
  const items = await getEquipment({ status: statusFilter });

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Equipment</h2>
          <p className="text-muted-foreground">
            {items.length} asset{items.length !== 1 ? "s" : ""} · tractors, sprayers, and tools
          </p>
        </div>
        <Button className="min-h-11 shrink-0 gap-2" render={<Link href="/equipment/new" />}>
          <Plus className="size-4" />
          <span className="hidden sm:inline">Add equipment</span>
          <span className="sm:hidden">Add</span>
        </Button>
      </div>

      <Suspense fallback={<div className="h-11 animate-pulse rounded-full bg-muted" />}>
        <EquipmentFilterBar />
      </Suspense>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          No equipment matches this filter.{" "}
          <Link href="/equipment/new" className="text-primary underline-offset-4 hover:underline">
            Add your first asset
          </Link>
        </p>
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <EquipmentListCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </div>
  );
}
