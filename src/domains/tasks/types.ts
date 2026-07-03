export type TaskTypeConfig = {
  id: string;
  slug: string;
  label: string;
  iconName: string;
  colorHex: string | null;
  sortOrder: number;
  active: boolean;
  showInQuickLog: boolean;
  defaultTitleTemplate: string | null;
  defaultDueDaysOffset: number | null;
  tracksGpsProgress: boolean;
  defaultSwathWidthM: number | null;
  _count?: { tasks: number };
};
