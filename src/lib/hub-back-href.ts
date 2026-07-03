/**
 * Build hub list URLs preserving filter query params when navigating back from detail/edit pages.
 */

type SearchParamValue = string | string[] | undefined;

function toQueryString(
  params: Record<string, SearchParamValue>,
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;
    if (Array.isArray(value)) {
      for (const v of value) sp.append(key, v);
    } else {
      sp.set(key, value);
    }
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export type TasksHubParams = {
  status?: string;
  blockId?: string;
  type?: string;
  q?: string;
  sort?: string;
  due?: string;
  view?: string;
  page?: string;
  assignee?: string;
  equipmentId?: string;
};

export function buildTasksHubHref(params: TasksHubParams = {}): string {
  return `/tasks${toQueryString(params)}`;
}

export type IrrigationHubParams = {
  view?: string;
  blockId?: string;
  active?: string;
  range?: string;
  status?: string;
  q?: string;
};

export function buildIrrigationHubHref(params: IrrigationHubParams = {}): string {
  return `/irrigation${toQueryString(params)}`;
}

export type EquipmentHubParams = {
  status?: string;
  type?: string;
  q?: string;
  due?: string;
  view?: string;
};

export function buildEquipmentHubHref(params: EquipmentHubParams = {}): string {
  return `/equipment${toQueryString(params)}`;
}

export function parseHubBackParams(
  searchParams: Record<string, string | string[] | undefined> | URLSearchParams,
): Record<string, string> {
  const out: Record<string, string> = {};
  const entries =
    searchParams instanceof URLSearchParams
      ? [...searchParams.entries()]
      : Object.entries(searchParams).flatMap(([k, v]) =>
          v === undefined
            ? []
            : Array.isArray(v)
              ? v.map((item) => [k, item] as const)
              : [[k, v] as const],
        );
  for (const [key, value] of entries) {
    if (key.startsWith("back")) continue;
    out[key] = value;
  }
  return out;
}

/** Prefix hub params for detail page links: ?backStatus=OPEN&backBlockId=... */
export function encodeBackParams(
  params: Record<string, string | undefined>,
): string {
  const sp = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) sp.set(`back${key.charAt(0).toUpperCase()}${key.slice(1)}`, value);
  }
  const qs = sp.toString();
  return qs ? `?${qs}` : "";
}

export function decodeBackParams(
  searchParams: Record<string, string | string[] | undefined>,
): TasksHubParams & IrrigationHubParams & EquipmentHubParams {
  const out: Record<string, string> = {};
  for (const [key, value] of Object.entries(searchParams)) {
    if (!key.startsWith("back") || !value || Array.isArray(value)) continue;
    const paramKey = key.charAt(4).toLowerCase() + key.slice(5);
    out[paramKey] = value;
  }
  return out;
}

export function buildDetailHref(
  basePath: string,
  id: string,
  backParams: Record<string, string | undefined> = {},
): string {
  return `${basePath}/${id}${encodeBackParams(backParams)}`;
}

export function tasksHubParamsFromSearch(params: {
  status?: string;
  blockId?: string;
  type?: string;
  q?: string;
  sort?: string;
  due?: string;
  view?: string;
  page?: string;
  assignee?: string;
  equipmentId?: string;
}): TasksHubParams {
  return {
    status: params.status,
    blockId: params.blockId,
    type: params.type,
    q: params.q,
    sort: params.sort,
    due: params.due,
    view: params.view,
    page: params.page,
    assignee: params.assignee,
    equipmentId: params.equipmentId,
  };
}

export function irrigationHubParamsFromSearch(params: {
  view?: string;
  blockId?: string;
  active?: string;
  range?: string;
  status?: string;
  q?: string;
}): IrrigationHubParams {
  return {
    view: params.view,
    blockId: params.blockId,
    active: params.active,
    range: params.range,
    status: params.status,
    q: params.q,
  };
}

export function equipmentHubParamsFromSearch(params: {
  status?: string;
  type?: string;
  q?: string;
  due?: string;
  view?: string;
}): EquipmentHubParams {
  return {
    status: params.status,
    type: params.type,
    q: params.q,
    due: params.due,
    view: params.view,
  };
}
