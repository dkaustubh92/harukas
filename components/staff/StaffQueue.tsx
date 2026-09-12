"use client";

import {
  formatStaffDate,
  priorityLabel,
  publicPriorityColor,
  statusLabel,
  type StaffPriority,
  type StaffReport,
  type StaffStatus,
} from "./types";

export type StatusFilter = "active" | "all" | StaffStatus;
export type PriorityFilter = "all" | StaffPriority;

interface StaffQueueProps {
  reports: StaffReport[];
  visibleReports: StaffReport[];
  selectedId: string | null;
  search: string;
  statusFilter: StatusFilter;
  priorityFilter: PriorityFilter;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onPriorityFilterChange: (value: PriorityFilter) => void;
  onSelect: (id: string) => void;
}

function priorityClass(priority: StaffPriority): string {
  switch (priority) {
    case "urgent":
      return "border-[#e7beb8] bg-[#fff3f0] text-[#8f332a]";
    case "priority":
      return "border-[#ecd5a8] bg-[#fff8e9] text-[#895b14]";
    case "routine":
      return "border-[#c9dbd1] bg-[#f0f7f1] text-[#426453]";
    default:
      return "border-[#c8d8e2] bg-[#f0f6fa] text-[#42627a]";
  }
}

function statusDot(status: StaffStatus): string {
  switch (status) {
    case "resolved":
      return "bg-[#7c8c84]";
    case "response_assigned":
      return "bg-[#3e7561]";
    case "inspection_requested":
      return "bg-[#b7761b]";
    case "reviewed":
      return "bg-[#5d7d91]";
    default:
      return "bg-[#b74637]";
  }
}

function initials(value: string): string {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function StaffQueue({
  reports,
  visibleReports,
  selectedId,
  search,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusFilterChange,
  onPriorityFilterChange,
  onSelect,
}: StaffQueueProps) {
  const urgentCount = reports.filter((report) => report.effectivePriority === "urgent").length;
  const activeCount = reports.filter((report) => report.status !== "resolved").length;
  const unresolvedCount = reports.filter((report) => report.status === "submitted").length;

  return (
    <aside className="flex min-h-0 flex-col border-b border-[#dfe6df] bg-[#fbfcfa] lg:border-b-0 lg:border-r">
      <div className="border-b border-[#e2e8e2] px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#607568]">
              Field desk
            </p>
            <h1 className="mt-1 text-[21px] font-semibold tracking-[-0.03em] text-[#183e32]">
              Report queue
            </h1>
          </div>
          <div className="rounded-full border border-[#d2e0d6] bg-[#eff7f0] px-2.5 py-1 text-[11px] font-medium text-[#426653]">
            Demo snapshot
          </div>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-2">
          <Metric value={activeCount} label="active" />
          <Metric value={unresolvedCount} label="new" tone="warm" />
          <Metric value={urgentCount} label="urgent" tone="urgent" />
        </div>
      </div>

      <div className="space-y-2.5 border-b border-[#e2e8e2] px-4 py-3.5">
        <label className="relative block">
          <span className="sr-only">Search report queue</span>
          <span
            aria-hidden="true"
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[14px] text-[#82948a]"
          >
            ⌕
          </span>
          <input
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search reference or street"
            className="h-9 w-full rounded-xl border border-[#d9e3dc] bg-white pl-8 pr-3 text-[12px] text-[#183e32] shadow-[0_1px_2px_rgba(24,62,50,0.03)] placeholder:text-[#91a099] focus:border-[#7da18d] focus:outline-none focus:ring-2 focus:ring-[#cfe2d5]"
          />
        </label>
        <div className="grid grid-cols-2 gap-2">
          <label>
            <span className="sr-only">Filter by status</span>
            <select
              value={statusFilter}
              onChange={(event) => onStatusFilterChange(event.target.value as StatusFilter)}
              className="h-8 w-full rounded-lg border border-[#d9e3dc] bg-white px-2.5 text-[11px] font-medium text-[#4b6257] focus:border-[#7da18d] focus:outline-none focus:ring-2 focus:ring-[#cfe2d5]"
            >
              <option value="active">Active reports</option>
              <option value="all">All statuses</option>
              <option value="submitted">New</option>
              <option value="reviewed">Reviewed</option>
              <option value="inspection_requested">Inspection requested</option>
              <option value="response_assigned">Response simulated</option>
              <option value="resolved">Resolved demo</option>
            </select>
          </label>
          <label>
            <span className="sr-only">Filter by priority</span>
            <select
              value={priorityFilter}
              onChange={(event) => onPriorityFilterChange(event.target.value as PriorityFilter)}
              className="h-8 w-full rounded-lg border border-[#d9e3dc] bg-white px-2.5 text-[11px] font-medium text-[#4b6257] focus:border-[#7da18d] focus:outline-none focus:ring-2 focus:ring-[#cfe2d5]"
            >
              <option value="all">All triage</option>
              <option value="urgent">Urgent review</option>
              <option value="priority">Priority review</option>
              <option value="unassessed">Needs assessment</option>
              <option value="routine">Routine review</option>
            </select>
          </label>
        </div>
        <p className="text-[10px] text-[#84958b]" aria-live="polite">
          Showing {visibleReports.length} of {reports.length} reports · newest sync is automatic
        </p>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-2.5">
        {visibleReports.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#d5e0d8] bg-white px-4 py-8 text-center">
            <p className="text-sm font-medium text-[#4b6257]">No matching reports</p>
            <p className="mt-1 text-[11px] leading-5 text-[#83958a]">
              Try another status, priority, or street name.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {visibleReports.map((report) => {
              const selected = report.id === selectedId;
              const priority = report.effectivePriority;
              const locationLabel = report.location.label.replace(/, HRM$/i, "");
              return (
                <button
                  key={report.id}
                  type="button"
                  aria-current={selected ? "true" : undefined}
                  onClick={() => onSelect(report.id)}
                  className={[
                    "group w-full rounded-xl border p-3 text-left transition focus:outline-none focus:ring-2 focus:ring-[#7da18d] focus:ring-offset-1",
                    selected
                      ? "border-[#7b9d89] bg-[#f2f8f2] shadow-[0_3px_10px_rgba(24,62,50,0.08)]"
                      : "border-[#e1e8e2] bg-white hover:border-[#b6cdbd] hover:bg-[#f9fcf9]",
                  ].join(" ")}
                >
                  <span className="flex items-start gap-2.5">
                    <span
                      aria-hidden="true"
                      className={"mt-1.5 h-2 w-2 shrink-0 rounded-full " + statusDot(report.status)}
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="truncate text-[13px] font-semibold tracking-[-0.01em] text-[#234d3e]">
                          {report.citizenDetails.title}
                        </span>
                        <span className="shrink-0 font-mono text-[10px] text-[#83958a]">
                          {report.reference}
                        </span>
                      </span>
                      <span className="mt-1 block truncate text-[11px] text-[#7a8c81]">
                        {locationLabel}
                      </span>
                    </span>
                  </span>
                  <span className="mt-2.5 flex items-center justify-between gap-2 pl-[18px]">
                    <span
                      className={"inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold " + priorityClass(priority)}
                    >
                      <span
                        aria-hidden="true"
                        className="mr-1 h-1.5 w-1.5 rounded-full"
                        style={{ backgroundColor: publicPriorityColor(priority) }}
                      />
                      {priorityLabel(priority)}
                    </span>
                    <span className="text-[10px] text-[#92a198]">{formatStaffDate(report.createdAt)}</span>
                  </span>
                  <span className="mt-2 flex items-center justify-between pl-[18px] text-[10px] text-[#819188]">
                    <span className="truncate">{statusLabel(report.status)}</span>
                    {report.source === "seed" ? (
                      <span className="ml-2 shrink-0 rounded bg-[#f3f0e7] px-1.5 py-0.5 font-medium text-[#817451]">
                        Seeded
                      </span>
                    ) : (
                      <span className="ml-2 shrink-0 rounded bg-[#eaf3f7] px-1.5 py-0.5 font-medium text-[#4d6e7d]">
                        Citizen report
                      </span>
                    )}
                  </span>
                  {report.officerPriority ? (
                    <span className="mt-2 block pl-[18px] text-[10px] font-medium text-[#4f7561]">
                      Human override · {initials(report.officerPriority.reason ?? "Officer")}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>
        )}
      </div>
      <div className="hidden border-t border-[#e2e8e2] px-5 py-3 text-[10px] leading-4 text-[#85968c] lg:block">
        Queue order follows HaruKas triage guidance: urgent, priority, needs assessment, then routine.
      </div>
    </aside>
  );
}

function Metric({ value, label, tone = "cool" }: { value: number; label: string; tone?: "cool" | "warm" | "urgent" }) {
  const accent = tone === "urgent" ? "text-[#a83c2e]" : tone === "warm" ? "text-[#a36314]" : "text-[#315b49]";
  return (
    <div className="rounded-xl border border-[#e1e8e2] bg-white px-2.5 py-2">
      <p className={"text-[17px] font-semibold tracking-[-0.04em] " + accent}>{value}</p>
      <p className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.12em] text-[#8b9b91]">{label}</p>
    </div>
  );
}
