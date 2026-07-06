import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BlockForm } from "@/components/blocks/block-form";
import { BlockPlantingsEditor } from "@/components/blocks/block-plantings-editor";
import { getBlockById } from "@/domains/blocks/queries";
import { getVarietiesForSettings } from "@/domains/varieties/queries";
import { requirePermission } from "@/lib/auth-session";
import type { BlockStatus, GrowthStage } from "@/generated/prisma/client";

export default async function EditBlockPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await requirePermission("blocks:edit");
  if ("error" in session) {
    redirect(`/blocks/${(await params).id}`);
  }

  const { id } = await params;
  const [block, varieties] = await Promise.all([
    getBlockById(id),
    getVarietiesForSettings(),
  ]);

  if (!block) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="shrink-0"
          render={<Link href={`/blocks/${block.id}`} aria-label="Back to block" />}
        >
          <ArrowLeft className="size-5" />
        </Button>
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Edit block</h2>
          <p className="text-sm text-muted-foreground">
            {block.code} · {block.name}
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Block details</CardTitle>
        </CardHeader>
        <CardContent>
          <BlockForm
            block={{
              id: block.id,
              code: block.code,
              name: block.name,
              status: block.status as BlockStatus,
              acreage: block.acreage,
              notes: block.notes,
              growthStage: block.growthStage as GrowthStage | null,
            }}
          />
        </CardContent>
      </Card>

      {block.blockType === "VINEYARD" && (
        <Card>
          <CardHeader>
            <CardTitle>Plantings</CardTitle>
          </CardHeader>
          <CardContent>
            <BlockPlantingsEditor
              blockId={block.id}
              plantings={block.plantings}
              varieties={varieties.map((v) => ({ id: v.id, name: v.name }))}
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
}
