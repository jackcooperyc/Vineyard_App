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
  },
  {
    slug: "SPRAYING",
    label: "Spraying",
    iconName: "SprayCan",
    sortOrder: 1,
    showInQuickLog: true,
    defaultTitleTemplate: "{{label}} — {{blockCode}}",
    defaultDueDaysOffset: 1,
  },
  {
    slug: "HARVESTING",
    label: "Harvesting",
    iconName: "Grape",
    sortOrder: 2,
    showInQuickLog: true,
    defaultTitleTemplate: "{{label}} — {{blockCode}}",
    defaultDueDaysOffset: 14,
  },
  {
    slug: "INSPECTION",
    label: "Inspection",
    iconName: "Search",
    sortOrder: 3,
    showInQuickLog: true,
    defaultTitleTemplate: "{{label}} — {{blockCode}}",
    defaultDueDaysOffset: 5,
  },
  {
    slug: "OTHER",
    label: "Other",
    iconName: "ListTodo",
    sortOrder: 4,
    showInQuickLog: true,
    defaultTitleTemplate: "{{label}} — {{blockCode}}",
    defaultDueDaysOffset: 7,
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
        active: true,
      },
    });
    bySlug.set(def.slug, row.id);
  }

  return bySlug;
}
