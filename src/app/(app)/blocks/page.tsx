import { getBlocks } from "@/domains/blocks/queries";
import { BlockListWithFilter } from "@/components/blocks/block-list-with-filter";

export default async function BlocksPage() {
  const blocks = await getBlocks();
  const vineyardCount = blocks.filter((b) => b.blockType === "VINEYARD").length;
  const infrastructureCount = blocks.filter(
    (b) => b.blockType === "INFRASTRUCTURE",
  ).length;

  return (
    <div className="field-readable mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight">Blocks</h2>
        <p className="text-muted-foreground">
          {vineyardCount} vineyard blocks · {infrastructureCount} infrastructure
          areas
        </p>
      </div>

      <BlockListWithFilter
        blocks={blocks}
        vineyardCount={vineyardCount}
        infrastructureCount={infrastructureCount}
      />
    </div>
  );
}
