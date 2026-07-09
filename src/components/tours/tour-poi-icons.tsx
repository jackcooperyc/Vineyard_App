import type { ReactElement, SVGProps } from "react";
import type { TourPOICategory } from "@/domains/tours/constants";
import { cn } from "@/lib/utils";

type IconProps = SVGProps<SVGSVGElement>;

const iconStroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function MilestoneIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      {...iconStroke}
      {...props}
    >
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  );
}

function FamilyIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      {...iconStroke}
      {...props}
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

function VarietalIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      {...iconStroke}
      {...props}
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  );
}

function TerroirIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      {...iconStroke}
      {...props}
    >
      <path d="M8 3 4 11l-2-2" />
      <path d="m16 3 4 8 2-2" />
      <path d="M12 20a4 4 0 0 0 4-4H8a4 4 0 0 0 4 4Z" />
      <path d="M2 15h20" />
    </svg>
  );
}

function ClubStoryIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      {...iconStroke}
      {...props}
    >
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

function HypeFutureExperienceIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      {...iconStroke}
      {...props}
    >
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  );
}

function PhotoOpportunityIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      {...iconStroke}
      {...props}
    >
      <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
      <circle cx="12" cy="13" r="3" />
    </svg>
  );
}

function TastingBarIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      {...iconStroke}
      {...props}
    >
      <path d="M8 22h8" />
      <path d="M7 10h10" />
      <path d="M12 15v7" />
      <path d="M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z" />
    </svg>
  );
}

function BathroomAccessIcon({ className, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden
      {...iconStroke}
      {...props}
    >
      <path d="M22 8.4V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.4" />
      <path d="M22 8.4A2 2 0 0 0 20.4 6H3.6A2 2 0 0 0 2 8.4" />
      <path d="M6 10v7" />
      <path d="M18 10v7" />
      <path d="M10 2v4" />
      <path d="M14 2v4" />
      <path d="M12 10v9" />
    </svg>
  );
}

export type TourPOIIconComponent = (props: IconProps) => ReactElement;

export const TOUR_POI_CATEGORY_ICONS: Record<TourPOICategory, TourPOIIconComponent> =
  {
    MILESTONE: MilestoneIcon,
    FAMILY: FamilyIcon,
    VARIETAL: VarietalIcon,
    TERROIR: TerroirIcon,
    CLUB_STORY: ClubStoryIcon,
    HYPE_FUTURE_EXPERIENCE: HypeFutureExperienceIcon,
    PHOTO_OPPORTUNITY: PhotoOpportunityIcon,
    TASTING_BAR: TastingBarIcon,
    BATHROOM_ACCESS: BathroomAccessIcon,
  };

export function TourPOICategoryIcon({
  category,
  className,
  ...props
}: {
  category: TourPOICategory;
  className?: string;
} & Omit<IconProps, "category">) {
  const Icon = TOUR_POI_CATEGORY_ICONS[category];
  return <Icon className={cn("size-6 shrink-0", className)} {...props} />;
}

type SvgChildDef =
  | { tag: "path"; d: string }
  | { tag: "polygon"; points: string }
  | { tag: "circle"; cx: string; cy: string; r: string };

const TOUR_POI_ICON_PATHS: Record<TourPOICategory, SvgChildDef[]> = {
  MILESTONE: [
    {
      tag: "polygon",
      points:
        "12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2",
    },
  ],
  FAMILY: [
    { tag: "path", d: "M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" },
    { tag: "circle", cx: "9", cy: "7", r: "4" },
    { tag: "path", d: "M23 21v-2a4 4 0 0 0-3-3.87" },
    { tag: "path", d: "M16 3.13a4 4 0 0 1 0 7.75" },
  ],
  VARIETAL: [
    {
      tag: "path",
      d: "M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z",
    },
    { tag: "path", d: "M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" },
  ],
  TERROIR: [
    { tag: "path", d: "M8 3 4 11l-2-2" },
    { tag: "path", d: "m16 3 4 8 2-2" },
    { tag: "path", d: "M12 20a4 4 0 0 0 4-4H8a4 4 0 0 0 4 4Z" },
    { tag: "path", d: "M2 15h20" },
  ],
  CLUB_STORY: [
    {
      tag: "path",
      d: "M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20",
    },
  ],
  HYPE_FUTURE_EXPERIENCE: [
    {
      tag: "path",
      d: "m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z",
    },
  ],
  PHOTO_OPPORTUNITY: [
    {
      tag: "path",
      d: "M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z",
    },
    { tag: "circle", cx: "12", cy: "13", r: "3" },
  ],
  TASTING_BAR: [
    { tag: "path", d: "M8 22h8" },
    { tag: "path", d: "M7 10h10" },
    { tag: "path", d: "M12 15v7" },
    {
      tag: "path",
      d: "M12 15a5 5 0 0 0 5-5c0-2-.5-4-2-8H9c-1.5 4-2 6-2 8a5 5 0 0 0 5 5Z",
    },
  ],
  BATHROOM_ACCESS: [
    { tag: "path", d: "M22 8.4V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.4" },
    { tag: "path", d: "M22 8.4A2 2 0 0 0 20.4 6H3.6A2 2 0 0 0 2 8.4" },
    { tag: "path", d: "M6 10v7" },
    { tag: "path", d: "M18 10v7" },
    { tag: "path", d: "M10 2v4" },
    { tag: "path", d: "M14 2v4" },
    { tag: "path", d: "M12 10v9" },
  ],
};

function appendSvgIcon(svg: SVGSVGElement, category: TourPOICategory) {
  const NS = "http://www.w3.org/2000/svg";
  for (const def of TOUR_POI_ICON_PATHS[category]) {
    const el = document.createElementNS(NS, def.tag);
    if (def.tag === "path") {
      el.setAttribute("d", def.d);
    } else if (def.tag === "polygon") {
      el.setAttribute("points", def.points);
    } else {
      el.setAttribute("cx", def.cx);
      el.setAttribute("cy", def.cy);
      el.setAttribute("r", def.r);
    }
    svg.appendChild(el);
  }
}

/** Mapbox marker element with category icon (uses currentColor for pin states). */
export function createTourPOIMarkerElement(
  category: TourPOICategory,
  selected: boolean,
  emphasized = true,
): HTMLDivElement {
  const root = document.createElement("div");
  root.className = cn(
    "group flex cursor-pointer flex-col items-center transition-all duration-150",
    selected && "z-10 scale-110",
    !emphasized && !selected && "scale-90 opacity-70",
  );
  root.dataset.category = category;
  root.dataset.selected = selected ? "true" : "false";
  root.dataset.emphasized = emphasized ? "true" : "false";

  const pin = document.createElement("div");
  pin.className = cn(
    "flex size-9 items-center justify-center rounded-full border-2 shadow-md transition-colors",
    selected
      ? "border-amber-500 bg-white text-amber-500"
      : "border-white bg-amber-500 text-white group-hover:bg-amber-400",
  );

  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("width", "18");
  svg.setAttribute("height", "18");
  svg.setAttribute("fill", "none");
  svg.setAttribute("stroke", "currentColor");
  svg.setAttribute("stroke-width", "2");
  svg.setAttribute("stroke-linecap", "round");
  svg.setAttribute("stroke-linejoin", "round");
  svg.setAttribute("aria-hidden", "true");
  appendSvgIcon(svg, category);

  pin.appendChild(svg);

  const tail = document.createElement("div");
  tail.className = cn(
    "-mt-1 size-2 rotate-45 border-r-2 border-b-2 transition-colors",
    selected
      ? "border-amber-500 bg-white"
      : "border-white bg-amber-500 group-hover:bg-amber-400",
  );

  root.appendChild(pin);
  root.appendChild(tail);

  return root;
}

export function updateTourPOIMarkerElement(
  element: HTMLElement,
  category: TourPOICategory,
  selected: boolean,
  emphasized = true,
) {
  const currentCategory = element.dataset.category;
  const currentSelected = element.dataset.selected === "true";
  const currentEmphasized = element.dataset.emphasized !== "false";

  if (currentEmphasized !== emphasized) {
    element.dataset.emphasized = emphasized ? "true" : "false";
    element.classList.toggle("scale-90", !emphasized && !selected);
    element.classList.toggle("opacity-70", !emphasized && !selected);
  }

  if (currentCategory !== category) {
    const svg = element.querySelector("svg");
    if (svg) {
      while (svg.firstChild) {
        svg.removeChild(svg.firstChild);
      }
      appendSvgIcon(svg, category);
    }
    element.dataset.category = category;
  }

  if (currentSelected !== selected) {
    element.dataset.selected = selected ? "true" : "false";
    element.classList.toggle("z-10", selected);
    element.classList.toggle("scale-110", selected);
    element.classList.toggle("scale-90", !emphasized && !selected);
    element.classList.toggle("opacity-70", !emphasized && !selected);

    const pin = element.firstElementChild as HTMLElement | null;
    const tail = element.lastElementChild as HTMLElement | null;

    if (pin) {
      pin.classList.toggle("border-amber-500", selected);
      pin.classList.toggle("bg-white", selected);
      pin.classList.toggle("text-amber-500", selected);
      pin.classList.toggle("border-white", !selected);
      pin.classList.toggle("bg-amber-500", !selected);
      pin.classList.toggle("text-white", !selected);
      pin.classList.toggle("group-hover:bg-amber-400", !selected);
    }

    if (tail) {
      tail.classList.toggle("border-amber-500", selected);
      tail.classList.toggle("bg-white", selected);
      tail.classList.toggle("border-white", !selected);
      tail.classList.toggle("bg-amber-500", !selected);
      tail.classList.toggle("group-hover:bg-amber-400", !selected);
    }
  }
}