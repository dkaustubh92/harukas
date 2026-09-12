import type { SVGProps } from "react";

export type CitizenIconName =
  | "arrow-right"
  | "arrow-up-right"
  | "camera"
  | "check"
  | "chevron-down"
  | "chevron-left"
  | "chevron-right"
  | "close"
  | "leaf"
  | "location"
  | "map-pin"
  | "refresh"
  | "shield"
  | "sparkle"
  | "tree"
  | "upload"
  | "warning";

export function Icon({
  name,
  size = 20,
  strokeWidth = 1.8,
  ...props
}: SVGProps<SVGSVGElement> & {
  name: CitizenIconName;
  size?: number;
  strokeWidth?: number;
}) {
  const shared = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };

  switch (name) {
    case "arrow-right":
      return <svg {...shared}><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></svg>;
    case "arrow-up-right":
      return <svg {...shared}><path d="M7 17 17 7" /><path d="M7 7h10v10" /></svg>;
    case "camera":
      return <svg {...shared}><path d="M4 7.5h3l1.3-2h7.4l1.3 2h3v11H4z" /><circle cx="12" cy="13" r="3.1" /></svg>;
    case "check":
      return <svg {...shared}><path d="m5 12.5 4.2 4.2L19 7" /></svg>;
    case "chevron-down":
      return <svg {...shared}><path d="m6 9 6 6 6-6" /></svg>;
    case "chevron-left":
      return <svg {...shared}><path d="m15 18-6-6 6-6" /></svg>;
    case "chevron-right":
      return <svg {...shared}><path d="m9 18 6-6-6-6" /></svg>;
    case "close":
      return <svg {...shared}><path d="M6 6 18 18M18 6 6 18" /></svg>;
    case "leaf":
      return <svg {...shared}><path d="M20 4C11 4 5 7.5 5 14c0 2.8 2 5 4.8 5 5.6 0 9.2-6.4 10.2-15Z" /><path d="M4 21c2.6-4.8 6.3-7.7 11-10" /></svg>;
    case "location":
      return <svg {...shared}><path d="M12 21s7-6.1 7-12a7 7 0 1 0-14 0c0 5.9 7 12 7 12Z" /><circle cx="12" cy="9" r="2.2" /></svg>;
    case "map-pin":
      return <svg {...shared}><path d="M19 10c0 5-7 11-7 11S5 15 5 10a7 7 0 1 1 14 0Z" /><circle cx="12" cy="10" r="2.2" /></svg>;
    case "refresh":
      return <svg {...shared}><path d="M20 11a8 8 0 0 0-13.4-5.9L5 6.7" /><path d="M4 3.7v3h3" /><path d="M4 13a8 8 0 0 0 13.4 5.9l1.6-1.6" /><path d="M20 20.3v-3h-3" /></svg>;
    case "shield":
      return <svg {...shared}><path d="M12 3 19 6v5.4c0 4.3-2.8 7.9-7 9.6-4.2-1.7-7-5.3-7-9.6V6z" /><path d="m8.7 12 2.2 2.2 4.5-4.5" /></svg>;
    case "sparkle":
      return <svg {...shared}><path d="m12 3 1.3 5.7L19 10l-5.7 1.3L12 17l-1.3-5.7L5 10l5.7-1.3Z" /><path d="m19 16 .5 2.5L22 19l-2.5.5L19 22l-.5-2.5L16 19l2.5-.5Z" /></svg>;
    case "tree":
      return <svg {...shared}><path d="M12 21V9" /><path d="m8.5 21 7 0" /><path d="M12 4.5c-1.7 0-3 1.3-3 3 0 .2 0 .4.1.6A3.6 3.6 0 0 0 7 11.5C7 13.4 8.6 15 10.5 15h3c1.9 0 3.5-1.6 3.5-3.5a3.6 3.6 0 0 0-2.1-3.4c.1-.2.1-.4.1-.6 0-1.7-1.3-3-3-3Z" /></svg>;
    case "upload":
      return <svg {...shared}><path d="M12 16V4" /><path d="m7 9 5-5 5 5" /><path d="M5 20h14" /></svg>;
    case "warning":
      return <svg {...shared}><path d="m12 4 9 16H3z" /><path d="M12 9v5" /><path d="M12 17h.01" /></svg>;
    default:
      return null;
  }
}
