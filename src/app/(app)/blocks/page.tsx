import { getBlocks } from "@/domains/blocks/queries";
import { BlockListCard } from "@/components/blocks/block-list-card";

export default async function BlocksPage() {
  const blocks = await getBlocks();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Blocks</h2>
        <p className="text-muted-foreground">
          {blocks.length} vineyard blocks · tap for details
        </p>
      </div>

      <div className="space-y-3">
        {blocks.map((block) => (
          <BlockListCard key={block.id} block={block} />
        ))}
      </div>
    </div>
  );
}
