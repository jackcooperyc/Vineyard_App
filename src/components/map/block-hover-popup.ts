import mapboxgl from "mapbox-gl";
import type { MapBlockFeatureProperties } from "@/domains/map/types";
import {
  EXTRUSION_LAYER_ID,
  FILL_LAYER_ID,
  OUTLINE_LAYER_ID,
} from "@/lib/maps/layers";

const HOVER_LAYER_IDS = [FILL_LAYER_ID, EXTRUSION_LAYER_ID, OUTLINE_LAYER_ID];

type HoverFeatureProps = Partial<MapBlockFeatureProperties> & {
  infrastructureType?: string;
  acreage?: number | string | null;
};

function asNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const n = Number(value);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

function asBoolean(value: unknown): boolean {
  return value === true || value === "true" || value === 1 || value === "1";
}

function statusCue(
  props: HoverFeatureProps,
): { label: string; tone: "ok" | "tasks" | "irrigation" } {
  if (asBoolean(props.irrigationOverdue)) {
    return { label: "Irrigation overdue", tone: "irrigation" };
  }
  const openTasks = asNumber(props.openTasks) ?? 0;
  if (openTasks > 0) {
    return {
      label: openTasks === 1 ? "1 open task" : `${openTasks} open tasks`,
      tone: "tasks",
    };
  }
  return { label: "No open issues", tone: "ok" };
}

function toneClass(tone: "ok" | "tasks" | "irrigation"): string {
  if (tone === "irrigation") return "background:#dbeafe;color:#1d4ed8";
  if (tone === "tasks") return "background:#fef3c7;color:#b45309";
  return "background:#dcfce7;color:#15803d";
}

/** Build a compact DOM node for the block hover popup (no actions). */
export function buildBlockHoverPopupContent(
  props: HoverFeatureProps,
): HTMLDivElement {
  const root = document.createElement("div");
  root.style.cssText =
    "min-width:11rem;max-width:16rem;font:12px/1.35 system-ui,sans-serif;color:#0f172a";

  const code = document.createElement("div");
  code.style.cssText =
    "font-family:ui-monospace,monospace;font-size:11px;color:#64748b";
  code.textContent = props.code ?? "";
  root.appendChild(code);

  const title = document.createElement("div");
  title.style.cssText = "font-weight:600;font-size:13px;margin-top:2px";
  title.textContent = props.name ?? "Block";
  root.appendChild(title);

  const meta = document.createElement("div");
  meta.style.cssText =
    "display:flex;align-items:center;gap:6px;margin-top:6px;color:#475569;flex-wrap:wrap";

  if (props.blockType === "INFRASTRUCTURE") {
    const infra = document.createElement("span");
    infra.textContent = props.infrastructureType || "Infrastructure";
    meta.appendChild(infra);
  } else {
    if (props.varietyColorHex) {
      const swatch = document.createElement("span");
      swatch.style.cssText = `display:inline-block;width:10px;height:10px;border-radius:2px;background:${props.varietyColorHex};box-shadow:inset 0 0 0 1px rgba(0,0,0,.2);flex-shrink:0`;
      swatch.setAttribute("aria-hidden", "true");
      meta.appendChild(swatch);
    }
    const variety = document.createElement("span");
    variety.textContent = props.varietyName || "No variety";
    meta.appendChild(variety);
  }

  const acreage = asNumber(props.acreage);
  if (acreage != null) {
    const acres = document.createElement("span");
    acres.textContent = `· ${acreage} ac`;
    meta.appendChild(acres);
  }

  root.appendChild(meta);

  const cue = statusCue(props);
  const badge = document.createElement("div");
  badge.style.cssText = `margin-top:8px;display:inline-block;border-radius:999px;padding:2px 8px;font-size:11px;font-weight:500;${toneClass(cue.tone)}`;
  badge.textContent = cue.label;
  root.appendChild(badge);

  return root;
}

/**
 * Register hover popups on block polygon layers.
 * Returns a cleanup function that removes listeners and the popup.
 */
export function registerBlockHoverPopups(map: mapboxgl.Map): () => void {
  const popup = new mapboxgl.Popup({
    closeButton: false,
    closeOnClick: false,
    offset: 12,
    maxWidth: "280px",
    className: "cev-block-hover-popup",
  });

  let hideTimer: ReturnType<typeof setTimeout> | null = null;
  let activeBlockId: string | null = null;

  const clearHideTimer = () => {
    if (hideTimer != null) {
      clearTimeout(hideTimer);
      hideTimer = null;
    }
  };

  const hidePopup = () => {
    clearHideTimer();
    activeBlockId = null;
    popup.remove();
    map.getCanvas().style.cursor = "";
  };

  const showForEvent = (
    event: mapboxgl.MapLayerMouseEvent,
  ) => {
    const feature = event.features?.[0];
    const props = feature?.properties as HoverFeatureProps | undefined;
    const blockId = props?.blockId;
    if (!props || typeof blockId !== "string") return;

    clearHideTimer();
    map.getCanvas().style.cursor = "pointer";

    if (activeBlockId !== blockId) {
      activeBlockId = blockId;
      popup.setDOMContent(buildBlockHoverPopupContent(props));
    }

    popup.setLngLat(event.lngLat).addTo(map);
  };

  const scheduleHide = () => {
    clearHideTimer();
    hideTimer = setTimeout(() => {
      const layers = HOVER_LAYER_IDS.filter((id) => map.getLayer(id));
      if (layers.length === 0) {
        hidePopup();
        return;
      }
      // If the pointer is still over any block layer, keep the popup.
      // mouseleave fires when crossing fill↔outline; a short delay avoids flicker.
      hidePopup();
    }, 80);
  };

  for (const layerId of HOVER_LAYER_IDS) {
    map.on("mousemove", layerId, showForEvent);
    map.on("mouseleave", layerId, scheduleHide);
  }

  return () => {
    clearHideTimer();
    for (const layerId of HOVER_LAYER_IDS) {
      map.off("mousemove", layerId, showForEvent);
      map.off("mouseleave", layerId, scheduleHide);
    }
    popup.remove();
  };
}
