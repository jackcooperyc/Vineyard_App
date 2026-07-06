import { IRRIGATION_FREQUENCIES } from "@/domains/irrigation/constants";

type BlockOption = { id: string; code: string; name: string };

export function formatBlockDetail(
  blocks: BlockOption[],
  blockId: string,
): string | undefined {
  const block = blocks.find((item) => item.id === blockId);
  return block ? `${block.code} · ${block.name}` : undefined;
}

export function formatIrrigationFrequencyLabel(frequency: string): string {
  return (
    IRRIGATION_FREQUENCIES.find((item) => item.value === frequency)?.label ??
    frequency
  );
}

export function formatIrrigationRecordDetail(input: {
  blockLabel?: string;
  method?: string | null;
  appliedAt?: string;
}): string | undefined {
  return [input.blockLabel, input.method, input.appliedAt]
    .filter(Boolean)
    .join(" · ");
}

export function formatIrrigationScheduleDetail(input: {
  blockLabel?: string;
  frequency?: string;
  method?: string | null;
}): string | undefined {
  const frequencyLabel = input.frequency
    ? formatIrrigationFrequencyLabel(input.frequency)
    : undefined;
  return [input.blockLabel, frequencyLabel, input.method]
    .filter(Boolean)
    .join(" · ");
}

export function formatIrrigationQuickLogDetail(input: {
  blockLabel?: string;
  count?: number;
  method?: string | null;
}): string | undefined {
  const { blockLabel, count = 1, method } = input;
  if (!blockLabel) return method ?? undefined;
  if (count > 1) {
    return [method, `${count} blocks`, blockLabel].filter(Boolean).join(" · ");
  }
  return [method, blockLabel].filter(Boolean).join(" · ");
}
