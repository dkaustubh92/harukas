"use client";
import { GeographicMap } from "../GeographicMap";
import type { CitizenReport } from "./types";
interface IncidentMapProps { reports: CitizenReport[]; selectedId: string | null; onSelect: (report: CitizenReport) => void; }
export function IncidentMap({ reports, selectedId, onSelect }: IncidentMapProps) {
  return <section className="overflow-hidden rounded-lg border border-[#cdd5cf] bg-white" aria-label="Halifax incident map">
    <GeographicMap className="h-[max(340px,calc(100dvh-280px))] max-h-[700px]" points={reports.map(report => ({
      id: report.id, latitude: report.location.latitude, longitude: report.location.longitude,
      title: `${report.reference} · ${report.citizenDetails.title}`,
      priority: report.officerPriority?.level ?? report.suggestedPriority.level,
      reviewed: report.status !== "resolved" && ["partial", "full"].includes(report.reviewedObstruction?.level ?? "none"),
    }))} selectedId={selectedId} onSelect={id => { const report = reports.find(r => r.id === id); if (report) onSelect(report); }} />
    <div className="flex flex-wrap items-center justify-between gap-2 border-t border-[#dce2dd] px-3 py-2 text-[11px] text-[#52645a]">
      <span>Fictional incidents on real Halifax geography</span>
      <span><span className="text-[#b54032]">●</span> Urgent <span className="ml-2 text-[#b57920]">●</span> Priority <span className="ml-2 text-[#346553]">●</span> Routine <span className="ml-2 text-[#4b6e8a]">●</span> Unassessed</span>
    </div>
  </section>;
}
