"use client";

import {
  formatCoordinates,
  mapMarkerPosition,
  priorityLabel,
  publicPriorityColor,
  statusLabel,
  type StaffReport,
} from "./types";

interface StaffMapProps {
  reports: StaffReport[];
  selectedId: string | null;
  showScenario: boolean;
  onSelect: (id: string) => void;
  onToggleScenario: () => void;
}

export function StaffMap({ reports, selectedId, showScenario, onSelect, onToggleScenario }: StaffMapProps) {
  const selectedReport = reports.find((report) => report.id === selectedId) ?? null;
  const selectedPosition = selectedReport ? mapMarkerPosition(selectedReport) : null;
  const selectedHasReviewedAccess = Boolean(
    selectedReport?.reviewedObstruction.level && selectedReport.reviewedObstruction.level !== "none",
  );

  return (
    <section className="flex min-h-[540px] min-w-0 flex-col bg-[#edf1ed] lg:min-h-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#dce5dd] bg-[#f7f9f6] px-5 py-3.5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#6e8276]">
            Location context
          </p>
          <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
            <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-[#254c3e]">
              Halifax incident map
            </h2>
            <span className="rounded-full border border-[#d7e0d8] bg-white px-2 py-0.5 text-[10px] font-medium text-[#718279]">
              Illustrative · not a closure map
            </span>
          </div>
        </div>
        <button
          type="button"
          aria-pressed={showScenario}
          onClick={onToggleScenario}
          className={
            "rounded-lg border px-3 py-2 text-[11px] font-semibold transition focus:outline-none focus:ring-2 focus:ring-[#7da18d] " +
            (showScenario
              ? "border-[#b9694d] bg-[#fff4ee] text-[#994d32]"
              : "border-[#d6e1d8] bg-white text-[#4e6c5c] hover:border-[#abc5b2]")
          }
        >
          {showScenario ? "Hide · If unresolved" : "Show · If unresolved"}
        </button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-hidden">
        <svg
          viewBox="0 0 760 620"
          className="absolute inset-0 h-full w-full"
          preserveAspectRatio="none"
          role="img"
          aria-label="Illustrative Halifax map showing fictional tree incident locations"
        >
          <rect width="760" height="620" fill="#e9efeb" />
          <path
            d="M0 0h176c38 26 54 62 61 101 9 48-4 73-3 111 1 27 16 58 2 86-15 29-43 48-57 81-16 37-14 87-38 122-19 28-47 43-89 52H0z"
            fill="#cfe4e2"
          />
          <path
            d="M760 0H654c-30 31-38 66-33 101 7 43 33 67 19 104-11 31-47 43-47 78 0 34 46 54 47 90 2 42-34 72-28 117 5 34 25 59 53 78h95z"
            fill="#cfe4e2"
          />
          <path
            d="M122 0c29 51 74 93 76 157 2 58-43 82-37 144 5 52 67 79 62 130-5 47-55 78-74 120"
            fill="none"
            stroke="#bdd7d5"
            strokeWidth="12"
            strokeLinecap="round"
          />
          <path
            d="M622 0c-42 56-53 102-26 151 26 48-7 84-13 128-9 65 45 96 38 156-4 37-22 61-38 92"
            fill="none"
            stroke="#bdd7d5"
            strokeWidth="16"
            strokeLinecap="round"
          />
          <g fill="none" stroke="#d0d9d1" strokeWidth="3" strokeLinecap="round">
            <path d="M116 42L272 118l198 9 126-51" />
            <path d="M78 117l157 42 215 4 209 65" />
            <path d="M62 212l147-31 164 61 250-24" />
            <path d="M78 316l179-61 139 41 258 16" />
            <path d="M71 420l178-80 145 58 273-53" />
            <path d="M122 515l152-91 149 40 249-86" />
            <path d="M267 29l-7 151 41 159-43 181" />
            <path d="M432 31l24 156-63 146 54 244" />
            <path d="M540 24l-41 161 72 133-68 212" />
          </g>
          <g fill="none" stroke="#fbfcfa" strokeWidth="10" strokeLinecap="round">
            <path d="M87 262L258 213l213 62 188-43" />
            <path d="M218 37l57 158-22 171 80 217" />
            <path d="M610 82l-134 101 27 151-125 155" />
          </g>
          <g fill="none" stroke="#b5c5b8" strokeWidth="2" strokeLinecap="round">
            <path d="M26 177l168 83 213-21 287 89" />
            <path d="M36 370l153-12 159 58 327-89" />
            <path d="M170 6l121 141 146 29 155 122" />
            <path d="M352 603l54-132-34-145 83-153" />
          </g>
          <g fill="#80958a" fontFamily="Arial, sans-serif" fontSize="12" fontWeight="600" letterSpacing="1.4">
            <text x="278" y="172">HALIFAX</text>
            <text x="497" y="289" opacity=".75">DARTMOUTH</text>
            <text x="83" y="356" opacity=".65">NORTH END</text>
            <text x="276" y="535" opacity=".6">QUINPOOL</text>
            <text x="592" y="480" opacity=".62">PORTLAND</text>
          </g>
          <g fill="#b9cbbd" opacity=".55">
            <circle cx="348" cy="206" r="17" />
            <circle cx="412" cy="239" r="9" />
            <circle cx="289" cy="297" r="13" />
            <circle cx="456" cy="355" r="12" />
            <circle cx="573" cy="352" r="7" />
            <circle cx="216" cy="393" r="10" />
          </g>
        </svg>

        <div className="pointer-events-none absolute left-5 top-5 rounded-xl border border-white/80 bg-white/85 px-3 py-2 shadow-[0_4px_14px_rgba(24,62,50,0.08)] backdrop-blur">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#607568]">HaruKas map</p>
          <p className="mt-1 text-[11px] text-[#829189]">25 fictional reports · cached context</p>
        </div>

        {showScenario && selectedPosition ? (
          <>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#c46f4b]/55 bg-[#edaa82]/20 shadow-[0_0_0_10px_rgba(196,111,75,0.05)]"
              style={{ left: selectedPosition.left, top: selectedPosition.top }}
            />
            <div
              className="pointer-events-none absolute -translate-x-1/2 translate-y-[74px] rounded-md border border-[#e7baa6] bg-[#fff8f3] px-2 py-1 text-[10px] font-medium text-[#9b5b3e] shadow-sm"
              style={{ left: selectedPosition.left, top: selectedPosition.top }}
            >
              Illustrative impact only
            </div>
          </>
        ) : null}

        <div className="absolute inset-0">
          {reports.map((report) => {
            const position = mapMarkerPosition(report);
            const selected = report.id === selectedId;
            const reviewed = report.reviewedObstruction.level !== "none" && report.status !== "resolved";
            return (
              <button
                key={report.id}
                type="button"
                title={report.reference + ": " + report.citizenDetails.title}
                aria-label={"Select " + report.reference + ", " + report.citizenDetails.title}
                aria-current={selected ? "true" : undefined}
                onClick={() => onSelect(report.id)}
                className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full p-1.5 focus:outline-none focus:ring-2 focus:ring-[#fff] focus:ring-offset-2 focus:ring-offset-[#78948a]"
                style={{ left: position.left, top: position.top }}
              >
                <span
                  className={
                    "relative flex h-5 w-5 items-center justify-center rounded-full border-2 border-white shadow-[0_2px_5px_rgba(24,62,50,0.32)] transition " +
                    (selected ? "h-7 w-7 ring-4 ring-[#f7fbf7]/90" : "") +
                    (reviewed ? " rotate-45 rounded-[6px]" : "")
                  }
                  style={{ backgroundColor: report.status === "resolved" ? "#7c8c84" : publicPriorityColor(report.effectivePriority) }}
                >
                  <span className={reviewed ? "-rotate-45 text-[9px] font-bold text-white" : "text-[9px] font-bold text-white"}>
                    {report.reference.slice(-1)}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        <div className="absolute bottom-4 left-4 rounded-xl border border-white/85 bg-white/90 px-3.5 py-3 shadow-[0_4px_14px_rgba(24,62,50,0.09)] backdrop-blur">
          <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#61756a]">Legend</p>
          <div className="grid gap-1.5 text-[10px] text-[#64786d]">
            <LegendDot color="#557894" label="Unreviewed report" />
            <LegendDot color="#a83c2e" label="Suggested urgent review" />
            <LegendDot color="#4a7966" label="Staff-reviewed obstruction" diamond />
          </div>
        </div>

        {selectedReport && selectedPosition ? (
          <div
            className="absolute bottom-4 right-4 max-w-[230px] rounded-xl border border-[#d9e5dc] bg-[#fbfdfb]/95 px-3.5 py-3 shadow-[0_4px_14px_rgba(24,62,50,0.09)] backdrop-blur"
            style={{ maxWidth: "min(230px, calc(100% - 2rem))" }}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[10px] font-semibold text-[#557468]">{selectedReport.reference}</p>
                <p className="mt-1 truncate text-[12px] font-semibold text-[#244e3e]">{selectedReport.location.label}</p>
              </div>
              <span className="shrink-0 rounded-full bg-[#eff6f0] px-1.5 py-0.5 text-[9px] font-semibold text-[#4a705b]">
                {selectedHasReviewedAccess ? "Reviewed" : "New"}
              </span>
            </div>
            <p className="mt-2 text-[10px] leading-4 text-[#73867c]">
              {formatCoordinates(selectedReport.location.latitude, selectedReport.location.longitude)}
            </p>
            <p className="mt-1 text-[10px] leading-4 text-[#82938a]">
              {statusLabel(selectedReport.status)} · {priorityLabel(selectedReport.effectivePriority)}
            </p>
          </div>
        ) : null}

        <div className="pointer-events-none absolute right-4 top-4 hidden rounded-lg border border-white/80 bg-white/75 px-2.5 py-2 text-right text-[9px] leading-4 text-[#73867b] backdrop-blur sm:block">
          <p className="font-medium text-[#5e7568]">North · WGS84</p>
          <p>Context is approximate and source-labelled</p>
        </div>
      </div>
    </section>
  );
}

function LegendDot({ color, label, diamond = false }: { color: string; label: string; diamond?: boolean }) {
  return (
    <span className="flex items-center gap-2">
      <span
        aria-hidden="true"
        className={"h-2.5 w-2.5 border border-white shadow-sm " + (diamond ? "rotate-45 rounded-[3px]" : "rounded-full")}
        style={{ backgroundColor: color }}
      />
      {label}
    </span>
  );
}
