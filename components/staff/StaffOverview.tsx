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

interface StaffOverviewProps {
  reports: StaffReport[];
  loading: boolean;
  onSelectReport: (id: string) => void;
  onOpenReports: () => void;
}

const priorityOrder: StaffPriority[] = ["urgent", "priority", "unassessed", "routine"];
const statusOrder: StaffStatus[] = [
  "submitted",
  "reviewed",
  "inspection_requested",
  "response_assigned",
  "resolved",
];

function countBy<T extends string>(values: T[], value: T): number {
  return values.filter((item) => item === value).length;
}

function priorityTone(priority: StaffPriority): string {
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

function statusTone(status: StaffStatus): string {
  switch (status) {
    case "submitted":
      return "bg-[#bb4b3d]";
    case "reviewed":
      return "bg-[#6b8795]";
    case "inspection_requested":
      return "bg-[#c08324]";
    case "response_assigned":
      return "bg-[#4b8168]";
    default:
      return "bg-[#86938c]";
  }
}

function shortStatusLabel(status: StaffStatus): string {
  switch (status) {
    case "submitted":
      return "New reports";
    case "inspection_requested":
      return "Inspection requested";
    case "response_assigned":
      return "Response simulated";
    default:
      return statusLabel(status);
  }
}

export function StaffOverview({
  reports,
  loading,
  onSelectReport,
  onOpenReports,
}: StaffOverviewProps) {
  const priorities = reports.map((report) => report.effectivePriority);
  const statuses = reports.map((report) => report.status);
  const activeReports = reports.filter((report) => report.status !== "resolved");
  const urgentReports = activeReports.filter((report) => report.effectivePriority === "urgent");
  const reviewedObstructions = activeReports.filter(
    (report) => report.reviewedObstruction.level !== "none",
  );
  const maxPriority = Math.max(1, ...priorityOrder.map((priority) => countBy(priorities, priority)));
  const maxStatus = Math.max(1, ...statusOrder.map((status) => countBy(statuses, status)));
  const recentReports = [...reports]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 5);

  return (
    <section className="min-h-full bg-[#edf1ed] px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#607568]">
              Field desk / overview
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-[-0.04em] text-[#183e32] sm:text-[30px]">
              What needs attention?
            </h1>
            <p className="mt-2 max-w-xl text-[12px] leading-5 text-[#6f8378]">
              A live read of the HaruKas demo queue. Counts reflect the reports loaded from the shared report store.
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenReports}
            className="inline-flex min-h-11 items-center rounded-xl bg-[#183e32] px-4 text-[12px] font-semibold text-white shadow-[0_4px_12px_rgba(24,62,50,0.16)] transition hover:bg-[#255441] focus:outline-none focus:ring-2 focus:ring-[#7da18d] focus:ring-offset-2"
          >
            Open report desk
            <span aria-hidden="true" className="ml-2 text-base">→</span>
          </button>
        </div>

        {loading ? (
          <div className="mt-5 rounded-xl border border-[#dce6dd] bg-white px-4 py-3 text-[11px] text-[#71867a]">
            Syncing the shared report queue…
          </div>
        ) : null}

        <div className="mt-5 grid gap-3 sm:grid-cols-2 md:grid-cols-4">
          <SummaryCard label="Reports in snapshot" value={reports.length} detail="All seeded and citizen reports" />
          <SummaryCard label="Active reports" value={activeReports.length} detail={`${reports.length - activeReports.length} resolved in demo`} tone="green" />
          <SummaryCard label="Urgent review" value={urgentReports.length} detail="Active human review queue" tone="red" />
          <SummaryCard label="Reviewed obstructions" value={reviewedObstructions.length} detail="Active public warning markers" tone="amber" />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)]">
          <section className="rounded-lg border border-[#dce6dd] bg-white p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#72867a]">Triage mix</p>
                <h2 className="mt-1 text-[17px] font-semibold tracking-[-0.02em] text-[#234d3e]">Priority across the queue</h2>
              </div>
              <span className="rounded-full border border-[#d9e5db] bg-[#f7faf7] px-2.5 py-1 text-[10px] text-[#708277]">{reports.length} total</span>
            </div>
            <div className="mt-5 grid gap-3">
              {priorityOrder.map((priority) => {
                const count = countBy(priorities, priority);
                return (
                  <div key={priority} className="grid grid-cols-[120px_1fr_28px] items-center gap-3 text-[11px]">
                    <span className="font-medium text-[#526a5d]">{priorityLabel(priority)}</span>
                    <div className="h-2.5 overflow-hidden rounded-full bg-[#edf2ed]" aria-hidden="true">
                      <div
                        className="h-full rounded-full transition-[width]"
                        style={{ width: `${(count / maxPriority) * 100}%`, backgroundColor: publicPriorityColor(priority) }}
                      />
                    </div>
                    <span className="text-right font-semibold tabular-nums text-[#294f40]">{count}</span>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-[10px] leading-4 text-[#87978e]">
              Priority is a HaruKas inspection suggestion. It does not represent a municipal severity code or a prediction of failure.
            </p>
          </section>

          <section className="rounded-lg border border-[#dce6dd] bg-white p-4 sm:p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#72867a]">Workflow</p>
                <h2 className="mt-1 text-[17px] font-semibold tracking-[-0.02em] text-[#234d3e]">Where reports are now</h2>
              </div>
              <span className="text-[10px] text-[#87978e]">Current status</span>
            </div>
            <div className="mt-5 grid gap-3">
              {statusOrder.map((status) => {
                const count = countBy(statuses, status);
                return (
                  <div key={status} className="flex items-center gap-3 text-[11px]">
                    <span aria-hidden="true" className={`h-2 w-2 shrink-0 rounded-full ${statusTone(status)}`} />
                    <span className="min-w-0 flex-1 truncate text-[#526a5d]">{shortStatusLabel(status)}</span>
                    <span className="font-semibold tabular-nums text-[#294f40]">{count}</span>
                    <div className="hidden h-1.5 w-16 overflow-hidden rounded-full bg-[#edf2ed] sm:block" aria-hidden="true">
                      <div className={`h-full rounded-full ${statusTone(status)}`} style={{ width: `${(count / maxStatus) * 100}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="mt-5 text-[10px] leading-4 text-[#87978e]">
              Simulated responses stay inside this demo. No crew, utility, or municipal system is contacted.
            </p>
          </section>
        </div>

        <section className="mt-4 rounded-lg border border-[#dce6dd] bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#e6ece6] px-4 py-4 sm:px-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-[#72867a]">Latest reports</p>
              <h2 className="mt-1 text-[17px] font-semibold tracking-[-0.02em] text-[#234d3e]">Start with the newest evidence</h2>
            </div>
            <button type="button" onClick={onOpenReports} className="text-[11px] font-semibold text-[#3c6d57] hover:text-[#183e32]">
              View all reports →
            </button>
          </div>
          <div className="divide-y divide-[#edf1ed]">
            {recentReports.map((report) => (
              <button
                key={report.id}
                type="button"
                onClick={() => onSelectReport(report.id)}
                className="flex min-h-[68px] w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-[#f8fbf8] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#7da18d] sm:px-5"
              >
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: publicPriorityColor(report.effectivePriority) }} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                    <span className="truncate text-[12px] font-semibold text-[#294f40]">{report.citizenDetails.title}</span>
                    <span className="font-mono text-[10px] text-[#8a9a90]">{report.reference}</span>
                  </span>
                  <span className="mt-1 block truncate text-[11px] text-[#82938a]">{report.location.label}</span>
                </span>
                <span className="hidden shrink-0 text-right sm:block">
                  <span className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${priorityTone(report.effectivePriority)}`}>
                    {priorityLabel(report.effectivePriority)}
                  </span>
                  <span className="mt-1 block text-[10px] text-[#94a29a]">{formatStaffDate(report.createdAt, false)}</span>
                </span>
                <span aria-hidden="true" className="text-[#86a095]">›</span>
              </button>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  detail,
  tone = "neutral",
}: {
  label: string;
  value: number;
  detail: string;
  tone?: "neutral" | "green" | "red" | "amber";
}) {
  const valueClass = {
    neutral: "text-[#294f40]",
    green: "text-[#3c7457]",
    red: "text-[#a83c2e]",
    amber: "text-[#a36314]",
  }[tone];
  return (
    <div className="rounded-lg border border-[#dce6dd] bg-white p-3.5">
      <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#72867a]">{label}</p>
      <p className={`mt-2 text-[30px] font-semibold tracking-[-0.06em] ${valueClass}`}>{value}</p>
      <p className="mt-1 text-[10px] text-[#87978e]">{detail}</p>
    </div>
  );
}
