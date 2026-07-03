import type { PrismaClient } from "../src/generated/prisma/client";

export const DEFAULT_TASK_TYPES = [
  {
    slug: "PRUNING",
    label: "Pruning",
    iconName: "Scissors",
    sortOrder: 0,
    showInQuickLog: true,
    defaultTitleTemplate: "{{label}} — {{blockCode}}",
    defaultDueDaysOffset: 3,
    tracksGpsProgress: false,
    defaultSwathWidthM: null,
  },
  {
    slug: "SPRAYING",
    label: "Spraying",
    iconName: "SprayCan",
    sortOrder: 1,
    showInQuickLog: true,
    defaultTitleTemplate: "{{label}} — {{blockCode}}",
    defaultDueDaysOffset: 1,
    tracksGpsProgress: true,
    defaultSwathWidthM: 2.5,
  },
  {
    slug: "WEEDING",
    label: "Weeding",
    iconName: "Shovel",
    sortOrder: 2,
    showInQuickLog: true,
    defaultTitleTemplate: "{{label}} — {{blockCode}}",
    defaultDueDaysOffset: 3,
    tracksGpsProgress: true,
    defaultSwathWidthM: 1.5,
  },
  {
    slug: "MOWING",
    label: "Mowing",
    iconName: "Tractor",
    sortOrder: 3,
    showInQuickLog: true,
    defaultTitleTemplate: "{{label}} — {{blockCode}}",
    defaultDueDaysOffset: 2,
    tracksGpsProgress: true,
    defaultSwathWidthM: 3.0,
  },
  {
    slug: "HARVESTING",
    label: "Harvesting",
    iconName: "Grape",
    sortOrder: 4,
    showInQuickLog: true,
    defaultTitleTemplate: "{{label}} — {{blockCode}}",
    defaultDueDaysOffset: 14,
    tracksGpsProgress: false,
    defaultSwathWidthM: null,
  },
  {
    slug: "INSPECTION",
    label: "Inspection",
    iconName: "Search",
    sortOrder: 5,
    showInQuickLog: true,
    defaultTitleTemplate: "{{label}} — {{blockCode}}",
    defaultDueDaysOffset: 5,
    tracksGpsProgress: false,
    defaultSwathWidthM: null,
  },
  {
    slug: "OTHER",
    label: "Other",
    iconName: "ListTodo",
    sortOrder: 6,
    showInQuickLog: true,
    defaultTitleTemplate: "{{label}} — {{blockCode}}",
    defaultDueDaysOffset: 7,
    tracksGpsProgress: false,
    defaultSwathWidthM: null,
  },
] as const;

export type TaskTypeSlug = (typeof DEFAULT_TASK_TYPES)[number]["slug"];

export async function seedTaskTypes(prisma: PrismaClient) {
  const bySlug = new Map<string, string>();

  for (const def of DEFAULT_TASK_TYPES) {
    const row = await prisma.taskTypeDefinition.upsert({
      where: { slug: def.slug },
      update: {
        label: def.label,
        iconName: def.iconName,
        sortOrder: def.sortOrder,
        showInQuickLog: def.showInQuickLog,
        defaultTitleTemplate: def.defaultTitleTemplate,
        defaultDueDaysOffset: def.defaultDueDaysOffset,
        tracksGpsProgress: def.tracksGpsProgress,
        defaultSwathWidthM: def.defaultSwathWidthM,
        active: true,
      },
      create: {
        slug: def.slug,
        label: def.label,
        iconName: def.iconName,
        sortOrder: def.sortOrder,
        showInQuickLog: def.showInQuickLog,
        defaultTitleTemplate: def.defaultTitleTemplate,
        defaultDueDaysOffset: def.defaultDueDaysOffset,
        tracksGpsProgress: def.tracksGpsProgress,
        defaultSwathWidthM: def.defaultSwathWidthM,
        active: true,
      },
    });
    bySlug.set(def.slug, row.id);
  }

  return bySlug;
}
