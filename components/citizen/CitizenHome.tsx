"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { DEMO_INCIDENTS } from "@/lib/demo-incidents";
import { Icon } from "./Icons";
import { IncidentMap } from "./IncidentMap";
import { ReportSheet } from "./ReportSheet";
import {
  LOCAL_REPORTS_KEY,
  REPRESENTATIVE_PHOTO_URL,
  type CitizenAnswer,
  type CitizenCategory,
  type CitizenDetails,
  type CitizenLocation,
  type CitizenObstruction,
  type CitizenPriority,
  type CitizenReceipt,
  type CitizenReport,
  type CitizenStatus,
  type CitizenTarget,
} from "./types";

const priorityLabels: Record<CitizenPriority, string> = {
  urgent: "Urgent review",
  priority: "Priority review",
  routine: "Routine review",
  unassessed: "Needs assessment",
};

const statusLabels: Record<string, string> = {
  submitted: "Submitted · awaiting review",
  reviewed: "Reviewed by staff · demo",
  inspection_requested: "Inspection requested · demo",
  response_assigned: "Response assigned · demo",
  resolved: "Resolved · demo",
};

const categoryLabels: Record<CitizenCategory, string> = {
  tree_damage: "Tree damage",
  access_obstruction: "Access obstruction",
  utility_conflict: "Possible utility conflict",
  other_unsure: "Other / unsure",
};

const targetLabels: Record<CitizenTarget, string> = {
  road: "road",
  sidewalk: "sidewalk",
  bus_stop: "bus stop",
  playground: "playground",
  building: "building",
  driveway: "driveway",
  other: "nearby area",
  unknown: "nearby area",
};

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function stringValue(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function numberValue(value: unknown, fallback: number) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function arrayOfStrings(value: unknown) {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [];
}

function answerValue(value: unknown): CitizenAnswer {
  return value === "yes" || value === "no" ? value : "unknown";
}

function obstructionValue(value: unknown): CitizenObstruction {
  return value === "none" || value === "partial" || value === "full" ? value : "unknown";
}

function categoryValue(value: unknown): CitizenCategory {
  return value === "tree_damage" || value === "access_obstruction" || value === "utility_conflict" ? value : "other_unsure";
}

function targetValues(value: unknown): CitizenTarget[] {
  if (!Array.isArray(value)) return ["unknown"];
  const allowed: CitizenTarget[] = ["road", "sidewalk", "bus_stop", "playground", "building", "driveway", "other", "unknown"];
  const targets = value.filter((item): item is CitizenTarget => typeof item === "string" && allowed.includes(item as CitizenTarget));
  return targets.length ? targets : ["unknown"];
}

function priorityValue(value: unknown): CitizenPriority {
  return value === "urgent" || value === "priority" || value === "routine" ? value : "unassessed";
}

function statusValue(value: unknown): CitizenStatus | string {
  return typeof value === "string" && value ? value : "submitted";
}

export function normalizeCitizenReport(raw: unknown): CitizenReport | null {
  const input = record(raw);
  if (!input) return null;
  const locationInput = record(input.location) ?? {};
  const detailsInput = record(input.citizenDetails) ?? {};
  const photoInput = record(input.photo) ?? {};
  const suggestionInput = record(input.suggestedPriority) ?? {};
  const officerPriorityInput = record(input.officerPriority);
  const reviewedInput = record(input.reviewedObstruction);
  const responseInput = record(input.response);
  const id = stringValue(input.id, stringValue(input.reference));
  if (!id) return null;
  const expectedPriority = priorityValue(input.expectedPriority ?? input.priority);
  const suggestionLevel = priorityValue(suggestionInput.level ?? expectedPriority);
  const now = new Date().toISOString();
  return {
    id,
    reference: stringValue(input.reference, `DEMO-${id.slice(0, 6).toUpperCase()}`),
    clientSubmissionId: stringValue(input.clientSubmissionId) || undefined,
    createdAt: stringValue(input.createdAt, now),
    updatedAt: stringValue(input.updatedAt, stringValue(input.createdAt, now)),
    version: typeof input.version === "number" ? input.version : undefined,
    isDemo: input.isDemo !== false,
    source: stringValue(input.source, "seed"),
    label: stringValue(input.label) || (stringValue(input.source, "seed") === "seed" ? "Seeded demo" : "Demo report"),
    location: {
      latitude: numberValue(locationInput.latitude, 44.645),
      longitude: numberValue(locationInput.longitude, -63.575),
      label: stringValue(locationInput.label, "Halifax, NS"),
      method: stringValue(locationInput.method, "pin"),
      confirmedAt: stringValue(locationInput.confirmedAt) || null,
    },
    photo: {
      url: stringValue(photoInput.url) || stringValue(photoInput.accessUrl) || stringValue(photoInput.signedUrl) || (stringValue(input.photoKey) ? `/demo-incidents/${stringValue(input.photoKey)}.jpg` : REPRESENTATIVE_PHOTO_URL),
      accessUrl: stringValue(photoInput.accessUrl) || null,
      signedUrl: stringValue(photoInput.signedUrl) || null,
      alt: stringValue(photoInput.alt, "Representative tree incident photo"),
      storagePath: stringValue(photoInput.storagePath) || null,
    },
    citizenDetails: {
      title: stringValue(detailsInput.title, "Tree incident near Halifax"),
      category: categoryValue(detailsInput.category),
      observations: stringValue(detailsInput.observations, "No observation provided."),
      targets: targetValues(detailsInput.targets),
      damageAboveTarget: answerValue(detailsInput.damageAboveTarget),
      obstruction: obstructionValue(detailsInput.obstruction),
      cause: typeof detailsInput.cause === "string" ? detailsInput.cause as CitizenDetails["cause"] : "unknown",
      utilityConcern: answerValue(detailsInput.utilityConcern),
      immediateDanger: answerValue(detailsInput.immediateDanger),
      reviewedAt: stringValue(detailsInput.reviewedAt) || null,
    },
    status: statusValue(input.status),
    suggestedPriority: {
      level: suggestionLevel,
      explanation: stringValue(suggestionInput.explanation) || stringValue(input.staffSummary) || null,
      supportingFields: arrayOfStrings(suggestionInput.supportingFields),
      ruleId: stringValue(suggestionInput.ruleId) || null,
    },
    officerPriority: officerPriorityInput
      ? { level: priorityValue(officerPriorityInput.level), explanation: stringValue(officerPriorityInput.reason) || stringValue(officerPriorityInput.explanation) || null, supportingFields: [], ruleId: null }
      : null,
    reviewedObstruction: reviewedInput
      ? { level: reviewedInput.level === "partial" || reviewedInput.level === "full" ? reviewedInput.level : "none", target: reviewedInput.target === "road" || reviewedInput.target === "sidewalk" ? reviewedInput.target : null, note: stringValue(reviewedInput.note) || null, reviewedAt: stringValue(reviewedInput.reviewedAt) || null }
      : null,
    response: responseInput ? { type: stringValue(responseInput.type), note: stringValue(responseInput.note) || null, requestedAt: stringValue(responseInput.requestedAt) || null } : null,
    analysis: record(input.analysis) ? { state: stringValue(record(input.analysis)?.state), label: stringValue(record(input.analysis)?.label) || null, warnings: arrayOfStrings(record(input.analysis)?.warnings) } : null,
    staffSummary: stringValue(input.staffSummary) || null,
    possibleImpact: stringValue(input.possibleImpact) || null,
    uncertainties: arrayOfStrings(input.uncertainties),
    url: stringValue(input.url) || undefined,
  };
}

const seededReports = DEMO_INCIDENTS.map((incident) => normalizeCitizenReport(incident)).filter((report): report is CitizenReport => Boolean(report));

function readLocalReports() {
  if (typeof window === "undefined") return [];
  try {
    const value: unknown = JSON.parse(window.localStorage.getItem(LOCAL_REPORTS_KEY) || "[]");
    return Array.isArray(value) ? value.map(normalizeCitizenReport).filter((report): report is CitizenReport => Boolean(report)) : [];
  } catch {
    return [];
  }
}

function mergeReports(...groups: CitizenReport[][]) {
  const byId = new Map<string, CitizenReport>();
  for (const group of groups) {
    for (const report of group) {
      if (!byId.has(report.id)) byId.set(report.id, report);
    }
  }
  return Array.from(byId.values()).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}

function effectivePriority(report: CitizenReport) {
  return report.officerPriority?.level ?? report.suggestedPriority.level;
}

function isPublicObstruction(report: CitizenReport) {
  return report.status !== "resolved" && (report.reviewedObstruction?.level === "partial" || report.reviewedObstruction?.level === "full");
}

function deriveLocalPriority(details: CitizenDetails): CitizenPriority {
  if (details.immediateDanger === "yes" || details.obstruction === "full") return "urgent";
  if (details.obstruction === "partial" || details.utilityConcern === "yes" || details.damageAboveTarget === "yes") return "priority";
  if (details.observations.trim() && details.obstruction === "none" && details.utilityConcern === "no" && details.immediateDanger === "no") return "routine";
  return "unassessed";
}

function saveLocalReport(input: { clientSubmissionId: string; location: CitizenLocation; citizenDetails: CitizenDetails; photoUrl: string }): CitizenReceipt {
  const existing = readLocalReports().find((report) => report.clientSubmissionId === input.clientSubmissionId);
  if (existing) return { mode: "local", report: existing, url: `#local-report-${existing.id}`, duplicate: true };
  const timestamp = new Date().toISOString();
  const id = `local-${input.clientSubmissionId}`;
  const ordinal = readLocalReports().length + 1;
  const report: CitizenReport = {
    id,
    reference: `LOCAL-DEMO-${String(ordinal).padStart(3, "0")}`,
    clientSubmissionId: input.clientSubmissionId,
    createdAt: timestamp,
    updatedAt: timestamp,
    version: 1,
    isDemo: true,
    source: "citizen",
    label: "Local demo · browser only",
    location: input.location,
    photo: { url: input.photoUrl, alt: "Representative tree incident photo" },
    citizenDetails: input.citizenDetails,
    status: "submitted",
    suggestedPriority: { level: deriveLocalPriority(input.citizenDetails), explanation: "Local demo triage based on the details you reviewed." },
    officerPriority: null,
    reviewedObstruction: { level: "none", target: null, note: "Awaiting demo staff review.", reviewedAt: null },
    response: null,
    analysis: { state: "manual", label: "Manual demo draft", warnings: ["This report is saved only in this browser because the shared API was unavailable."] },
    uncertainties: ["This local demo copy is not shared with another device."],
  };
  if (typeof window !== "undefined") {
    const next = [...readLocalReports(), report];
    window.localStorage.setItem(LOCAL_REPORTS_KEY, JSON.stringify(next));
  }
  return { mode: "local", report, url: `#local-report-${report.id}` };
}

function formatRelativeDate(dateValue: string) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return "recently";
  return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(date);
}

export default function CitizenHome() {
  const [reports, setReports] = useState<CitizenReport[]>(() => seededReports);
  const [selectedId, setSelectedId] = useState<string | null>(seededReports[0]?.id ?? null);
  const [reportOpen, setReportOpen] = useState(false);
  const [receipt, setReceipt] = useState<CitizenReceipt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [feedError, setFeedError] = useState("");
  const [usingFallback, setUsingFallback] = useState(false);
  const [activeSurface, setActiveSurface] = useState<"map" | "list">("map");
  const [detailOpen, setDetailOpen] = useState(false);

  const loadReports = useCallback(async (showLoading = false) => {
    if (showLoading) setIsLoading(true);
    try {
      const response = await fetch("/api/reports", { cache: "no-store" });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error("Shared reports are temporarily unavailable.");
      const input = record(body);
      const apiReports = Array.isArray(input?.reports) ? input.reports.map(normalizeCitizenReport).filter((report): report is CitizenReport => Boolean(report)) : [];
      if (!input || !Array.isArray(input.reports)) throw new Error("Shared reports returned an unexpected response.");
      const nextReports = mergeReports(apiReports, readLocalReports(), seededReports);
      setReports(nextReports);
      setSelectedId((current) => current && nextReports.some((report) => report.id === current) ? current : nextReports[0]?.id ?? null);
      setUsingFallback(apiReports.length === 0);
      setFeedError("");
    } catch (error) {
      const nextReports = mergeReports(readLocalReports(), seededReports);
      setReports(nextReports);
      setSelectedId((current) => current && nextReports.some((report) => report.id === current) ? current : nextReports[0]?.id ?? null);
      setUsingFallback(true);
      setFeedError(error instanceof Error ? error.message : "Shared reports are temporarily unavailable.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const initialLoad = window.setTimeout(() => void loadReports(true), 0);
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadReports(false);
    }, 5000);
    return () => {
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
    };
  }, [loadReports]);

  useEffect(() => {
    if (!detailOpen) return;
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setDetailOpen(false);
    };
    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [detailOpen]);

  const activeReports = useMemo(() => reports.filter((report) => report.status !== "resolved"), [reports]);
  const selectedReport = reports.find((report) => report.id === selectedId) ?? activeReports[0] ?? null;
  const reviewedCount = activeReports.filter(isPublicObstruction).length;

  const selectReport = (report: CitizenReport) => {
    setSelectedId(report.id);
    setDetailOpen(true);
  };

  const handleSaved = (savedReceipt: CitizenReceipt) => {
    setReceipt(savedReceipt);
    const normalized = normalizeCitizenReport(savedReceipt.report);
    if (normalized) {
      setReports((current) => mergeReports([normalized], current));
      setSelectedId(normalized.id);
    }
    setReportOpen(false);
    window.setTimeout(() => document.getElementById("receipt")?.scrollIntoView({ behavior: "smooth", block: "center" }), 50);
  };

  return (
    <main className="min-h-dvh overflow-x-hidden bg-[#f7f8f3] text-[#183e32]">
      <header className="mx-auto flex max-w-7xl items-center justify-between border-b border-[#e1e7e0] px-5 py-3 sm:px-8 lg:px-10">
        <Link href="/" className="group inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-offset-4" aria-label="HaruKas home">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#183e32] text-[#dce8d8] transition group-hover:bg-[#255644]"><Icon name="leaf" size={17} strokeWidth={1.7} /></span>
          <span className="text-[15px] font-semibold tracking-[-0.02em] text-[#183e32]">HaruKas</span>
        </Link>
        <Link href="/staff" className="inline-flex min-h-10 items-center gap-2 rounded-lg px-2 text-sm font-semibold text-[#486b5c] underline-offset-4 transition hover:bg-[#eef5ef] hover:underline">Staff demo <Icon name="arrow-up-right" size={15} /></Link>
      </header>

      <section className="mx-auto max-w-7xl px-5 py-4 sm:px-8 lg:px-10">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
          <div className="min-w-0">
            <h1 className="truncate text-[clamp(1.8rem,4vw,2rem)] font-semibold leading-[1.08] tracking-[-0.045em] text-[#183e32]">Halifax tree reports</h1>
            <p className="mt-1 text-xs text-[#718474]">Demo snapshot · fictional reports · not sent to Halifax.</p>
          </div>
          <button type="button" onClick={() => setReportOpen(true)} className="inline-flex min-h-10 w-full shrink-0 items-center justify-center gap-2 rounded-lg bg-[#183e32] px-4 text-sm font-semibold text-white shadow-[0_7px_16px_rgba(24,62,50,0.16)] transition hover:bg-[#255644] sm:w-auto">Report an incident <Icon name="arrow-right" size={17} /></button>
        </div>
      </section>

      {receipt && <ReceiptCard receipt={receipt} />}

      <section id="reports" className="mx-auto max-w-7xl scroll-mt-4 px-5 pb-2 sm:px-8 lg:px-10">
        <div className="mb-3 flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
          <h2 className="sr-only">Community reports</h2>
          <div className="flex items-center gap-3 text-sm text-[#718474]"><span>{activeReports.length} active demo reports</span><button type="button" className="inline-flex min-h-10 items-center gap-1.5 rounded-lg px-2 text-sm font-semibold text-[#486b5c] hover:bg-[#eef5ef]" onClick={() => void loadReports(true)}><Icon name="refresh" size={14} /> Refresh</button></div>
        </div>

        {feedError && <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#ebd4a7] bg-[#fff8e9] px-4 py-3 text-sm text-[#85500e]" role="status"><span><strong className="font-semibold">Showing a cached demo snapshot.</strong> {feedError}</span><button type="button" className="min-h-10 rounded-lg border border-[#d9bd82] bg-white px-3 font-semibold text-[#85500e] hover:bg-[#fffdf7]" onClick={() => void loadReports(true)}>Try again</button></div>}
        {usingFallback && !feedError && <p className="mb-4 inline-flex items-center gap-2 text-xs text-[#607568]"><Icon name="check" size={14} className="text-[#4d896d]" /> Cached demo snapshot · fictional reports</p>}

        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="inline-flex rounded-lg border border-[#ccd8cd] bg-white p-1" role="tablist" aria-label="Choose report view">
            <button type="button" role="tab" id="map-tab" aria-selected={activeSurface === "map"} aria-controls="map-panel" onClick={() => setActiveSurface("map")} className={`inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${activeSurface === "map" ? "bg-[#183e32] text-white" : "text-[#607568] hover:bg-[#eef5ef]"}`}><Icon name="map-pin" size={15} /> Map</button>
            <button type="button" role="tab" id="list-tab" aria-selected={activeSurface === "list"} aria-controls="list-panel" onClick={() => setActiveSurface("list")} className={`inline-flex min-h-9 items-center gap-2 rounded-md px-3 text-sm font-semibold transition ${activeSurface === "list" ? "bg-[#183e32] text-white" : "text-[#607568] hover:bg-[#eef5ef]"}`}><Icon name="tree" size={15} /> List</button>
          </div>
          <p className="text-xs text-[#718474]">{reviewedCount} staff-reviewed obstruction{reviewedCount === 1 ? "" : "s"}</p>
        </div>

        {activeSurface === "map" ? <div id="map-panel" role="tabpanel" aria-labelledby="map-tab"><IncidentMap reports={activeReports} selectedId={selectedId} onSelect={selectReport} /></div> : <div id="list-panel" role="tabpanel" aria-labelledby="list-tab">{isLoading && reports.length === 0 ? <div className="rounded-xl border border-dashed border-[#c8d9ca] bg-white p-8 text-center text-sm text-[#718474]">Loading the Halifax snapshot…</div> : <div className="overflow-hidden rounded-xl border border-[#d7e0d8] bg-white divide-y divide-[#e5ebe4]">{activeReports.slice(0, 9).map((report) => <ReportListItem key={report.id} report={report} selected={report.id === selectedId} onSelect={() => selectReport(report)} />)}</div>}</div>}

        {detailOpen && selectedReport && <ReportDrawer report={selectedReport} onClose={() => setDetailOpen(false)} />}
      </section>

      <ReportSheet open={reportOpen} onClose={() => setReportOpen(false)} onSaved={handleSaved} onSaveLocal={saveLocalReport} />
    </main>
  );
}

function ReportDrawer({ report, onClose }: { report: CitizenReport; onClose: () => void }) {
  return <aside id="report-detail-drawer" role="dialog" aria-labelledby="report-drawer-title" className="fixed inset-x-3 bottom-3 z-40 max-h-[min(80vh,42rem)] overflow-y-auto rounded-2xl border border-[#cbd8cb] bg-white shadow-[0_20px_60px_rgba(24,62,50,0.2)] sm:inset-auto sm:bottom-5 sm:right-5 sm:w-[min(27rem,calc(100vw-2.5rem))]">
    <div className="flex items-start justify-between gap-4 border-b border-[#e4ebe3] px-4 py-3.5">
      <div>
        <p id="report-drawer-title" className="text-sm font-semibold text-[#183e32]">Report details</p>
        <p className="mt-0.5 text-xs text-[#718474]">{report.reference} · demo</p>
      </div>
      <button type="button" onClick={onClose} aria-label="Close report details" className="inline-flex min-h-9 min-w-9 items-center justify-center rounded-lg text-[#607568] hover:bg-[#eef5ef] hover:text-[#183e32]"><Icon name="close" size={17} /></button>
    </div>
    <div className="p-4"><SelectedReport report={report} /></div>
  </aside>;
}

function SelectedReport({ report }: { report: CitizenReport }) {
  const reviewed = isPublicObstruction(report);
  const photoUrl = report.photo.url || report.photo.accessUrl || report.photo.signedUrl || REPRESENTATIVE_PHOTO_URL;
  return <div>
    <div className="mb-4 flex gap-3"><div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-lg bg-[#dce9eb]"><Image src={photoUrl} alt={report.photo.alt || "Tree incident"} fill sizes="80px" unoptimized className="object-cover" /></div><div className="min-w-0"><p className="truncate text-base font-semibold text-[#183e32]">{report.citizenDetails.title}</p><p className="mt-1 flex items-center gap-1.5 text-xs text-[#718474]"><Icon name="map-pin" size={13} /> {report.location.label}</p><p className="mt-1 text-xs font-medium text-[#607568]">{formatRelativeDate(report.createdAt)}</p></div></div>
    <p className="text-sm leading-6 text-[#486b5c]">{report.citizenDetails.observations}</p>
    <p className="mt-3 text-xs font-medium text-[#607568]">{categoryLabels[report.citizenDetails.category]} · Near {report.citizenDetails.targets.map((target) => targetLabels[target]).join(", ")}{reviewed ? " · Reported obstruction (demo)" : ""}</p>
    <div className="mt-4 border-t border-[#e3eae2] pt-4"><p className="text-xs font-semibold text-[#355c4c]">{statusLabels[report.status] || "Demo report status"}</p><p className="mt-1 text-xs leading-5 text-[#718474]">{reviewed ? "Staff review identified a possible access impact. This is not an official closure." : "This report is visible for demo review and has not been confirmed as an obstruction."}</p></div>
    {report.url && report.url.startsWith("/") && <a href={report.url} className="mt-4 inline-flex min-h-10 items-center gap-1.5 text-sm font-semibold text-[#2f6a4e] hover:text-[#183e32]">Open report <Icon name="arrow-up-right" size={15} /></a>}
  </div>;
}

function ReportListItem({ report, selected, onSelect }: { report: CitizenReport; selected: boolean; onSelect: () => void }) {
  const priority = effectivePriority(report);
  return <button type="button" onClick={onSelect} aria-pressed={selected} className={`group flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition focus-visible:z-10 ${selected ? "bg-[#f1f7ef]" : "hover:bg-[#fafcf8]"}`}><div className="min-w-0"><div className="flex items-center gap-2"><span className={`h-2.5 w-2.5 shrink-0 rounded-full ${priority === "urgent" ? "bg-[#a83c2e]" : priority === "priority" ? "bg-[#a36314]" : priority === "routine" ? "bg-[#557267]" : "bg-[#486b86]"}`} aria-hidden="true" /><p className="truncate text-sm font-semibold text-[#355c4c]">{report.citizenDetails.title}</p></div><p className="mt-1 truncate pl-[18px] text-xs text-[#839487]">{report.location.label}</p></div><div className="shrink-0 text-right"><p className="text-[11px] font-semibold text-[#607568]">{isPublicObstruction(report) ? "Obstruction" : priorityLabels[priority]}</p><p className="mt-1 text-[11px] font-medium text-[#718474]">{report.reference}</p></div></button>;
}

function ReceiptCard({ receipt }: { receipt: CitizenReceipt }) {
  const report = receipt.report;
  const local = receipt.mode === "local";
  const reportUrl = receipt.url || (local ? `#local-report-${report.id}` : `/reports/${report.id}`);
  return <section id="receipt" className="mx-auto mb-12 max-w-7xl scroll-mt-5 px-5 sm:px-8 lg:px-10"><div className={`overflow-hidden rounded-[1.75rem] border shadow-[0_16px_42px_rgba(24,62,50,0.08)] ${local ? "border-[#ebd4a7] bg-[#fffaf0]" : "border-[#bad4bf] bg-[#f0f8f1]"}`}><div className="flex flex-col gap-5 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-7"><div className="flex items-start gap-4"><span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${local ? "bg-[#f3dfaf] text-[#85500e]" : "bg-[#cfe6d3] text-[#2f6a4e]"}`}>{local ? <Icon name="warning" size={21} /> : <Icon name="check" size={23} />}</span><div><div className="flex flex-wrap items-center gap-2"><p className="text-[11px] font-semibold uppercase tracking-[0.17em] text-[#607568]">{local ? "Local demo receipt" : "Report received"}</p>{local && <span className="rounded-full bg-[#f3dfaf] px-2 py-1 text-[10px] font-semibold text-[#85500e]">Browser only</span>}</div><h2 className="mt-1 text-xl font-semibold tracking-[-0.025em] text-[#183e32]">{report.reference}</h2><p className="mt-1 text-sm leading-6 text-[#486b5c]">{local ? "The shared save was unavailable, so this draft is available in this browser for rehearsal." : "Your demo report is saved to the shared HaruKas workspace."}</p></div></div><div className="flex flex-col items-stretch gap-2 sm:items-end"><a href={reportUrl} className={`inline-flex min-h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition ${local ? "border border-[#d9bd82] bg-white text-[#85500e] hover:bg-[#fffdf7]" : "bg-[#183e32] text-white hover:bg-[#255644]"}`}>{local ? "Keep this demo copy" : "Open report status"} <Icon name="arrow-up-right" size={16} /></a><span className="text-center text-xs text-[#718474] sm:text-right">Not sent to Halifax · {statusLabels[report.status] || "Submitted · demo"}</span></div></div><div className="grid gap-3 border-t border-black/5 px-5 py-4 text-xs text-[#607568] sm:grid-cols-3 sm:px-7"><span><strong className="font-semibold text-[#355c4c]">Location</strong><br />{report.location.label}</span><span><strong className="font-semibold text-[#355c4c]">Summary</strong><br />{report.citizenDetails.title}</span><span><strong className="font-semibold text-[#355c4c]">Next step</strong><br />A human can review the evidence in the demo workspace.</span></div></div></section>;
}
