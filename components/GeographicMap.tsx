"use client";
import dynamic from "next/dynamic";
export interface MapPoint {
  id: string; latitude: number; longitude: number; title: string;
  priority: "urgent" | "priority" | "routine" | "unassessed";
  reviewed?: boolean;
}
export interface GeographicMapProps {
  points: MapPoint[]; selectedId?: string | null;
  onSelect?: (id: string) => void;
  onLocationPick?: (latitude: number, longitude: number) => void;
  className?: string;
}
const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => <div className="flex h-full min-h-64 items-center justify-center bg-[#e9eeec] text-sm text-[#52615a]">Loading Halifax street map…</div>,
});
export function GeographicMap(props: GeographicMapProps) {
  return <div className={props.className ?? "h-[480px]"}><LeafletMap {...props} /></div>;
}
