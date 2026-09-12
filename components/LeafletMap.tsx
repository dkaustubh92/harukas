"use client";
import { useEffect, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./geographic-map.css";
import type { GeographicMapProps } from "./GeographicMap";
const colors = { urgent: "#b54032", priority: "#b57920", routine: "#346553", unassessed: "#4b6e8a" };
export default function LeafletMap({ points, selectedId, onSelect, onLocationPick }: GeographicMapProps) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const layers = useRef<L.LayerGroup | null>(null);
  const callbacks = useRef({ onSelect, onLocationPick });
  const fitted = useRef(false);
  const previousSelection = useRef(selectedId);
  const [tileError, setTileError] = useState(false);
  useEffect(() => { callbacks.current = { onSelect, onLocationPick }; }, [onSelect, onLocationPick]);
  useEffect(() => {
    if (!container.current) return;
    const instance = L.map(container.current, { scrollWheelZoom: false }).setView([44.658, -63.585], 12);
    map.current = instance;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).on("tileerror", () => setTileError(true)).on("tileload", () => setTileError(false)).addTo(instance);
    L.control.scale({ imperial: false, position: "bottomleft" }).addTo(instance);
    layers.current = L.layerGroup().addTo(instance);
    instance.on("click", (event: L.LeafletMouseEvent) => callbacks.current.onLocationPick?.(event.latlng.lat, event.latlng.lng));
    const resize = new ResizeObserver(() => instance.invalidateSize());
    resize.observe(container.current);
    return () => { resize.disconnect(); instance.remove(); map.current = null; layers.current = null; fitted.current = false; };
  }, []);
  useEffect(() => {
    if (!map.current || !layers.current) return;
    const instance = map.current;
    layers.current.clearLayers();
    const valid = points.filter(p => Number.isFinite(p.latitude) && Number.isFinite(p.longitude) && Math.abs(p.latitude) <= 85 && Math.abs(p.longitude) <= 180);
    valid.forEach(point => {
      const selected = point.id === selectedId;
      const marker = L.marker([point.latitude, point.longitude], {
        icon: L.divIcon({
          className: `harukas-marker${selected ? " is-selected" : ""}`,
          html: `<span style="background:${colors[point.priority]}" class="harukas-marker-dot${point.reviewed ? " is-reviewed" : ""}">${point.reviewed ? "!" : ""}</span>`,
          iconSize: [32, 32], iconAnchor: [16, 16],
        }), title: point.title, alt: point.title, keyboard: true, zIndexOffset: selected ? 1000 : 0,
      });
      const label = document.createElement("span");
      label.textContent = point.title;
      marker.bindTooltip(label, { direction: "top", offset: [0, -12] });
      marker.on("click", () => callbacks.current.onSelect?.(point.id));
      marker.addTo(layers.current!);
      marker.getElement()?.setAttribute("aria-pressed", String(selected));
      marker.getElement()?.setAttribute("aria-label", point.title);
    });
    if (valid.length && !fitted.current) {
      instance.fitBounds(L.latLngBounds(valid.map(p => [p.latitude, p.longitude])), { padding: [35, 35], maxZoom: valid.length === 1 ? 15 : 13 });
      fitted.current = true;
    }
    const selected = valid.find(p => p.id === selectedId);
    if (selected && (previousSelection.current !== selectedId || onLocationPick)) instance.setView([selected.latitude, selected.longitude], Math.max(instance.getZoom(), 14), { animate: false });
    previousSelection.current = selectedId;
  }, [points, selectedId, onLocationPick]);
  return <div className="relative isolate h-full w-full">
    <div ref={container} className="h-full w-full" role="region" aria-label={onLocationPick ? "Choose a location on the Halifax street map" : "Halifax street map with selectable incident markers"} />
    {tileError && <p role="status" className="absolute bottom-7 left-2 z-[1000] max-w-72 rounded bg-white px-3 py-2 text-xs text-red-800 shadow">Some map tiles could not load. Reports remain available in the list.</p>}
    <button type="button" className="absolute right-3 top-3 z-[1000] rounded-md border border-[#bcc8c1] bg-white px-3 py-2 text-xs font-semibold text-[#254b3c] shadow-sm" onClick={() => {
      const valid = points.filter(p => Number.isFinite(p.latitude) && Number.isFinite(p.longitude));
      if (valid.length) map.current?.fitBounds(L.latLngBounds(valid.map(p => [p.latitude, p.longitude])), { padding: [35, 35], maxZoom: valid.length === 1 ? 15 : 13 });
    }}>Fit {onLocationPick ? "pin" : "reports"}</button>
  </div>;
}
