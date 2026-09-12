import { Icon } from "./Icons";
import type { CitizenPriority, CitizenReport } from "./types";

interface IncidentMapProps {
  reports: CitizenReport[];
  selectedId: string | null;
  onSelect: (report: CitizenReport) => void;
}

const priorityLabel: Record<CitizenPriority, string> = {
  urgent: "Urgent review",
  priority: "Priority review",
  routine: "Routine review",
  unassessed: "Needs assessment",
};

const markerTone: Record<CitizenPriority, string> = {
  urgent: "border-[#a83c2e] bg-[#fff2ef] text-[#8f2f24]",
  priority: "border-[#a36314] bg-[#fff8e9] text-[#85500e]",
  routine: "border-[#557267] bg-[#eef5ef] text-[#355c4c]",
  unassessed: "border-[#486b86] bg-[#eff5fa] text-[#365c75]",
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function positionFor(report: CitizenReport) {
  // A deliberately approximate viewport around the Halifax peninsula. The map
  // is a readable fallback for the demo, not a claim of survey precision.
  const left = clamp(((report.location.longitude + 63.65) / 0.13) * 100, 7, 93);
  const top = clamp(((44.71 - report.location.latitude) / 0.15) * 100, 8, 90);
  return { left: `${left}%`, top: `${top}%` };
}

function priorityFor(report: CitizenReport): CitizenPriority {
  return report.officerPriority?.level ?? report.suggestedPriority.level;
}

function isReviewedObstruction(report: CitizenReport) {
  return (
    report.status !== "resolved" &&
    (report.reviewedObstruction?.level === "partial" || report.reviewedObstruction?.level === "full")
  );
}

export function IncidentMap({ reports, selectedId, onSelect }: IncidentMapProps) {
  return (
    <section className="overflow-hidden rounded-[1.75rem] border border-[#d7e0d8] bg-[#e8f0e8] shadow-[0_18px_50px_rgba(24,62,50,0.08)]" aria-labelledby="map-title">
      <div className="flex items-center justify-between gap-4 border-b border-[#d7e0d8] bg-[#f6faf5] px-5 py-4 sm:px-6">
        <div>
          <div className="mb-1 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#607568]">
            <span className="inline-flex h-2 w-2 rounded-full bg-[#4d896d]" aria-hidden="true" />
            <span>Live demo snapshot</span>
          </div>
          <h2 id="map-title" className="text-lg font-semibold tracking-[-0.02em] text-[#183e32]">Reports around Halifax</h2>
        </div>
        <span className="hidden rounded-full border border-[#d7e0d8] bg-white px-3 py-1.5 text-xs font-medium text-[#607568] sm:inline-flex">2D overview</span>
      </div>

      <div className="relative aspect-[1.35/1] min-h-[270px] overflow-hidden bg-[#cfe1e4] sm:min-h-[330px]" role="region" aria-label="Illustrative Halifax map with selectable tree incident markers">
        <svg className="absolute inset-0 h-full w-full" viewBox="0 0 700 480" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 0h700v480H0z" fill="#dce9eb" />
          <path d="M0 0h432c-8 39-28 61-23 91 8 43-34 68-23 106 11 37 61 47 43 81-19 37-74 38-89 72-11 25-8 78-7 130H0Z" fill="#d7e9da" />
          <path d="M432 0h268v480H347c-2-51-4-105 7-130 15-34 70-35 89-72 18-34-32-44-43-81-11-38 31-63 23-106-5-30 15-52 23-91Z" fill="#dce9eb" />
          <path d="M340 0c-20 57-30 105-23 148 7 42 43 68 34 104-9 34-56 51-62 91-6 44 25 87 27 137" stroke="#b6d4cf" strokeWidth="12" fill="none" opacity=".78" />
          <path d="M95 21c75 68 100 119 96 187-4 66 27 109 71 155" stroke="#b8d7bd" strokeWidth="22" fill="none" opacity=".72" />
          <path d="M502 0c-25 47-32 85-18 127 16 48 77 78 79 131 2 54-53 76-76 109-21 31-19 78-9 113" stroke="#b6d4cf" strokeWidth="14" fill="none" opacity=".8" />
          <path d="M37 303c113-32 207-51 296-45 98 7 179 58 321 37" stroke="#a8c6ab" strokeWidth="5" fill="none" opacity=".85" />
          <path d="M24 396c99-44 185-62 271-48 104 17 176 42 366 14" stroke="#bad4bc" strokeWidth="4" fill="none" opacity=".9" />
          <path d="M112 70c77 62 155 90 236 84 99-7 143-61 265-66" stroke="#c7dcca" strokeWidth="3" fill="none" />
          <path d="M60 167c123 28 215 21 298-19 83-40 140-44 275-10" stroke="#c0d7c2" strokeWidth="2.5" fill="none" />
          <g fill="#b1ccae" opacity=".65">
            <circle cx="108" cy="104" r="18" /><circle cx="153" cy="136" r="9" /><circle cx="206" cy="88" r="13" />
            <circle cx="265" cy="326" r="17" /><circle cx="308" cy="382" r="9" /><circle cx="566" cy="191" r="16" />
            <circle cx="610" cy="268" r="10" /><circle cx="476" cy="355" r="19" /><circle cx="579" cy="401" r="13" />
          </g>
        </svg>

        <div className="pointer-events-none absolute left-4 top-4 rounded-xl border border-white/80 bg-white/85 px-3 py-2 shadow-sm backdrop-blur-sm sm:left-5 sm:top-5">
          <p className="text-xs font-semibold text-[#183e32]">Halifax peninsula</p>
          <p className="mt-0.5 text-[11px] text-[#607568]">Approximate report locations</p>
        </div>

        {reports.map((report) => {
          const priority = priorityFor(report);
          const reviewedObstruction = isReviewedObstruction(report);
          const selected = report.id === selectedId;
          const position = positionFor(report);
          return (
            <button
              key={report.id}
              type="button"
              className="group absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full p-1.5 transition-transform hover:scale-110 focus-visible:z-20 focus-visible:scale-110"
              style={position}
              onClick={() => onSelect(report)}
              aria-label={`${report.reference}, ${priorityLabel[priority]}${reviewedObstruction ? ", reported obstruction" : ", unreviewed report"}`}
              aria-pressed={selected}
            >
              <span className={`relative flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-[0_4px_12px_rgba(24,62,50,0.18)] ${markerTone[priority]} ${selected ? "ring-4 ring-white/90 ring-offset-2 ring-offset-[#cfe1e4]" : ""}`}>
                {reviewedObstruction ? <Icon name="warning" size={14} strokeWidth={2.2} /> : <span className="h-2.5 w-2.5 rounded-full bg-current" aria-hidden="true" />}
                <span className="sr-only">{reviewedObstruction ? "Reported obstruction" : "Unreviewed report"}</span>
              </span>
              <span className="pointer-events-none absolute left-1/2 top-full mt-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-[#183e32] px-2 py-1 text-[10px] font-medium text-white shadow-lg group-hover:block group-focus-visible:block">{report.reference}</span>
            </button>
          );
        })}

        <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center gap-2 sm:bottom-5 sm:left-5 sm:right-auto">
          <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-2 text-[11px] font-medium text-[#436052] shadow-sm backdrop-blur-sm">
            <span className="h-2.5 w-2.5 rounded-full border-2 border-[#557267] bg-[#eef5ef]" aria-hidden="true" />
            Unreviewed report
          </div>
          <div className="flex items-center gap-2 rounded-full border border-white/80 bg-white/90 px-3 py-2 text-[11px] font-medium text-[#436052] shadow-sm backdrop-blur-sm">
            <Icon name="warning" size={13} strokeWidth={2.1} />
            Reported obstruction · Demo
          </div>
        </div>
      </div>

      <div className="flex items-start gap-3 border-t border-[#d7e0d8] bg-[#f6faf5] px-5 py-3.5 text-xs leading-5 text-[#607568] sm:px-6">
        <Icon name="map-pin" size={16} className="mt-0.5 shrink-0 text-[#4d896d]" />
        <p>Markers are approximate demo locations. A reported obstruction is shown only after staff review; it is not an official closure.</p>
      </div>
    </section>
  );
}
