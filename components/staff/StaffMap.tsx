"use client";
import { GeographicMap } from "../GeographicMap";
import type { StaffReport } from "./types";
interface StaffMapProps { reports: StaffReport[]; selectedId: string | null; showScenario: boolean; onSelect: (id: string) => void; onToggleScenario: () => void; }
export function StaffMap({ reports, selectedId, showScenario, onSelect, onToggleScenario }: StaffMapProps) {
  const selected = reports.find(r => r.id === selectedId);
  return <section className="flex min-h-[500px] min-w-0 flex-col bg-white">
    <div className="flex items-center justify-between gap-3 border-b border-[#dce2dd] px-4 py-3">
      <h2 className="text-sm font-semibold text-[#254b3c]">Halifax incident map</h2>
      <button type="button" aria-pressed={showScenario} onClick={onToggleScenario} className="rounded-md border border-[#cdd5cf] px-2.5 py-1.5 text-xs text-[#52645a]">{showScenario ? "Hide impact note" : "Impact note"}</button>
    </div>
    <GeographicMap className="min-h-[420px] flex-1" points={reports.map(report => ({
      id: report.id, latitude: report.location.latitude, longitude: report.location.longitude,
      title: `${report.reference} · ${report.citizenDetails.title}`, priority: report.effectivePriority,
      reviewed: report.status !== "resolved" && report.reviewedObstruction.level !== "none",
    }))} selectedId={selectedId} onSelect={onSelect} />
    {showScenario && selected && <div className="border-t border-[#e4d5bd] bg-[#fffbf2] px-4 py-3 text-xs leading-5 text-[#735727]"><strong>Illustrative impact, not a closure prediction. </strong>{selected.possibleImpact || "An unresolved obstruction may continue to affect access. A field inspection is needed to establish actual impact."}</div>}
    <p className="border-t border-[#dce2dd] px-4 py-2 text-[11px] text-[#52645a]">Real street geography · Fictional reports · Square markers indicate staff-reviewed obstructions.</p>
  </section>;
}
