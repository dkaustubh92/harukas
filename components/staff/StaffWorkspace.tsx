"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StaffEvidence, type ResponseType } from "./StaffEvidence";
import { StaffMap } from "./StaffMap";
import { StaffOverview } from "./StaffOverview";
import {
  StaffQueue,
  type PriorityFilter,
  type StatusFilter,
} from "./StaffQueue";
import {
  createFallbackStaffReports,
  normalizeStaffReport,
  normalizeStaffReports,
  type ActionType,
  type ObstructionLevel,
  type StaffPriority,
  type StaffReport,
} from "./types";

type JsonRecord = Record<string, unknown>;

function isRecord(value: unknown): value is JsonRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function errorMessage(value: unknown, fallback: string): string {
  if (!isRecord(value)) return fallback;
  const error = isRecord(value.error) ? value.error : value;
  return typeof error.message === "string" ? error.message : fallback;
}

function readLocalReports(): StaffReport[] {
  if (typeof window === "undefined") return [];
  try {
    const parsed: unknown = JSON.parse(
      window.localStorage.getItem("harukas:local-reports") ?? "[]",
    );
    return normalizeStaffReports(parsed);
  } catch {
    return [];
  }
}

function mergeReports(primary: StaffReport[], fallback: StaffReport[]): StaffReport[] {
  const reports = new Map<string, StaffReport>();
  for (const report of [...primary, ...fallback]) {
    if (!reports.has(report.id)) reports.set(report.id, report);
  }
  return [...reports.values()];
}

function newestCitizenReport(reports: StaffReport[]): StaffReport | undefined {
  return [...reports]
    .filter((report) => report.source === "citizen" && report.status !== "resolved")
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))[0];
}

export default function StaffWorkspace() {
  const [reports, setReports] = useState<StaffReport[]>(() => createFallbackStaffReports());
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const selectedIdRef = useRef<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("active");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [showScenario, setShowScenario] = useState(false);
  const [showPopulationDensity, setShowPopulationDensity] = useState(false);
  const [loading, setLoading] = useState(true);
  const [feedError, setFeedError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);
  const [actionBusy, setActionBusy] = useState<ActionType | null>(null);
  const [actionMessage, setActionMessage] = useState<{
    kind: "success" | "warning";
    text: string;
  } | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [lastAction, setLastAction] = useState<ActionType | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "reports">("overview");
  const [detailOpen, setDetailOpen] = useState(false);
  const [evidenceCollapsed, setEvidenceCollapsed] = useState(false);

  const [priorityDraft, setPriorityDraft] = useState<StaffPriority>("unassessed");
  const [priorityNote, setPriorityNote] = useState("Visible evidence reviewed by demo officer.");
  const [inspectionNote, setInspectionNote] = useState("Inspect the reported tree and access impact.");
  const [responseType, setResponseType] = useState<ResponseType>("inspection");
  const [responseNote, setResponseNote] = useState("Response assignment simulated for the live demo.");
  const [obstructionLevel, setObstructionLevel] = useState<ObstructionLevel>("none");
  const [obstructionTarget, setObstructionTarget] = useState("sidewalk");
  const [obstructionNote, setObstructionNote] = useState("Access impact reviewed in the demo.");
  const [resolutionNote, setResolutionNote] = useState("Demo report resolved after review.");

  const loadReports = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    try {
      const response = await fetch("/api/reports?view=staff", { cache: "no-store" });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(errorMessage(body, "The staff queue is unavailable."));
      if (!isRecord(body) || !Array.isArray(body.reports)) {
        throw new Error("The staff queue returned an unexpected response.");
      }
      const apiReports = normalizeStaffReports(body.reports);
      const next = mergeReports(apiReports, readLocalReports());
      setReports(next);
      setFeedError(null);
      setUsingFallback(false);
      const current = selectedIdRef.current;
      const nextSelection = current && next.some((report) => report.id === current)
        ? current
        : newestCitizenReport(next)?.id ?? next[0]?.id ?? null;
      selectedIdRef.current = nextSelection;
      setSelectedId(nextSelection);
      const selected = next.find((report) => report.id === nextSelection);
      if (selected) {
        setPriorityDraft(selected.effectivePriority);
        setObstructionLevel(selected.reviewedObstruction.level);
        setObstructionTarget(selected.reviewedObstruction.target ?? "sidewalk");
      }
    } catch (error) {
      const next = mergeReports(readLocalReports(), createFallbackStaffReports());
      setReports(next);
      setUsingFallback(true);
      setFeedError(error instanceof Error ? error.message : "The staff queue is unavailable.");
      const nextSelection = selectedIdRef.current ?? newestCitizenReport(next)?.id ?? next[0]?.id ?? null;
      selectedIdRef.current = nextSelection;
      setSelectedId(nextSelection);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const initial = window.setTimeout(() => void loadReports(true), 0);
    const interval = window.setInterval(() => {
      if (document.visibilityState === "visible") void loadReports(false);
    }, 5000);
    const refresh = () => {
      if (document.visibilityState === "visible") void loadReports(false);
    };
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearTimeout(initial);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [loadReports]);

  const visibleReports = useMemo(() => {
    const query = search.trim().toLowerCase();
      return reports
      .filter((report) => {
        if (statusFilter === "active" && report.status === "resolved") return false;
        if (statusFilter !== "active" && statusFilter !== "all" && report.status !== statusFilter) return false;
        if (priorityFilter !== "all" && report.effectivePriority !== priorityFilter) return false;
        if (!query) return true;
        return `${report.reference} ${report.citizenDetails.title} ${report.location.label}`
          .toLowerCase()
          .includes(query);
      })
      .sort((a, b) => {
        const priorityRank: Record<StaffPriority, number> = {
          urgent: 0,
          priority: 1,
          unassessed: 2,
          routine: 3,
        };
        const priorityDifference = priorityRank[a.effectivePriority] - priorityRank[b.effectivePriority];
        if (priorityDifference !== 0) return priorityDifference;
        const densityDifference = (b.suggestedPriority.withinBandRank ?? 0) - (a.suggestedPriority.withinBandRank ?? 0);
        if (densityDifference !== 0) return densityDifference;
        return b.createdAt.localeCompare(a.createdAt);
      });
  }, [priorityFilter, reports, search, statusFilter]);

  const resolvedSelectedId = selectedId && visibleReports.some((report) => report.id === selectedId)
    ? selectedId
    : visibleReports[0]?.id ?? null;
  const selectedReport = reports.find((report) => report.id === resolvedSelectedId) ?? null;

  const handleSelect = useCallback((id: string) => {
    const report = reports.find((item) => item.id === id);
    selectedIdRef.current = id;
    setSelectedId(id);
    if (report) {
      setPriorityDraft(report.effectivePriority);
      setObstructionLevel(report.reviewedObstruction.level);
      setObstructionTarget(report.reviewedObstruction.target ?? "sidewalk");
    }
    setActionError(null);
    setActionMessage(null);
  }, [reports]);

  const openReportDetail = useCallback((id: string) => {
    handleSelect(id);
    setDetailOpen(true);
  }, [handleSelect]);

  const performAction = useCallback(
    async (type: ActionType) => {
      if (!selectedReport) return;

      const payload: JsonRecord = {
        actionId: crypto.randomUUID(),
        expectedVersion: selectedReport.version,
        type,
      };
      if (type === "review") payload.note = "Evidence reviewed in the HaruKas demo.";
      if (type === "set_priority") {
        if (!priorityNote.trim()) {
          setActionError("Add a reason for the priority change.");
          return;
        }
        payload.priority = priorityDraft;
        payload.note = priorityNote;
      }
      if (type === "request_inspection") payload.note = inspectionNote;
      if (type === "assign_response") {
        payload.responseType = responseType;
        payload.note = responseNote;
      }
      if (type === "mark_obstruction") {
        payload.obstructionLevel = obstructionLevel;
        if (obstructionLevel !== "none") payload.target = obstructionTarget;
        payload.note = obstructionNote;
      }
      if (type === "resolve") payload.note = resolutionNote;

      setActionBusy(type);
      setActionError(null);
      setActionMessage(null);
      setLastAction(type);
      try {
        const response = await fetch(`/api/reports/${selectedReport.id}/actions`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const body: unknown = await response.json().catch(() => null);
        if (!response.ok) {
          if (response.status === 409) await loadReports(false);
          throw new Error(errorMessage(body, "The demo action could not be saved."));
        }
        if (!isRecord(body) || !isRecord(body.report)) {
          throw new Error("The action response did not include the updated report.");
        }
        const updated = normalizeStaffReport(body.report);
        setReports((current) => current.map((report) => (report.id === updated.id ? updated : report)));
        setPriorityDraft(updated.effectivePriority);
        setObstructionLevel(updated.reviewedObstruction.level);
        setObstructionTarget(updated.reviewedObstruction.target ?? "sidewalk");
        setActionMessage({
          kind: "success",
          text:
            type === "assign_response"
              ? "Response assigned in HaruKas. No crew was dispatched."
              : "Demo decision saved.",
        });
      } catch (error) {
        setActionError(error instanceof Error ? error.message : "The demo action could not be saved.");
      } finally {
        setActionBusy(null);
      }
    }, [
      inspectionNote,
      loadReports,
      obstructionLevel,
      obstructionNote,
      obstructionTarget,
      priorityDraft,
      priorityNote,
      resolutionNote,
      responseNote,
      responseType,
      selectedReport,
    ],
  );

  return (
    <main className="min-h-dvh bg-[#edf1ed] text-[#183e32]">
      <header className="flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-[#d8e1d9] bg-[#f9faf7] px-5 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="text-lg font-semibold tracking-[-0.04em] text-[#183e32]">
            HaruKas
          </Link>
          <span className="h-5 w-px bg-[#cdd8cf]" aria-hidden="true" />
          <span className="text-sm font-medium text-[#607568]">Officer demo</span>
          {loading ? <span className="text-xs text-[#84958b]">Syncing…</span> : null}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="hidden max-w-md text-right text-[#7c8c83] md:block">
            Demo only. Shared by this running server and reset on restart.
          </span>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center rounded-lg border border-[#c8d5ca] bg-white px-3 font-semibold text-[#355c4c] hover:bg-[#f1f6f1]"
          >
            Citizen view
          </Link>
        </div>
      </header>

      {feedError ? (
        <div className="flex items-center justify-between gap-3 border-b border-[#e4cfae] bg-[#fff8ec] px-5 py-2 text-xs text-[#765b2d]">
          <span>{feedError} {usingFallback ? "Showing the browser demo snapshot." : ""}</span>
          <button type="button" onClick={() => void loadReports(true)} className="min-h-9 rounded-lg border border-[#dfc69d] bg-white px-3 font-semibold">
            Retry
          </button>
        </div>
      ) : null}

      <nav className="flex items-center gap-1 border-b border-[#d8e1d9] bg-[#f9faf7] px-5 lg:px-6" aria-label="Officer workspace">
        <button
          type="button"
          onClick={() => setActiveTab("overview")}
          aria-current={activeTab === "overview" ? "page" : undefined}
          className={[
            "min-h-12 border-b-2 px-3 text-[12px] font-semibold transition",
            activeTab === "overview" ? "border-[#2f7254] text-[#214f3d]" : "border-transparent text-[#7a8c81] hover:text-[#355c4c]",
          ].join(" ")}
        >
          Overview
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("reports")}
          aria-current={activeTab === "reports" ? "page" : undefined}
          className={[
            "min-h-12 border-b-2 px-3 text-[12px] font-semibold transition",
            activeTab === "reports" ? "border-[#2f7254] text-[#214f3d]" : "border-transparent text-[#7a8c81] hover:text-[#355c4c]",
          ].join(" ")}
        >
          Reports
          <span className="ml-1.5 rounded-full bg-[#e8f1e9] px-1.5 py-0.5 text-[10px] text-[#4c705b]">{reports.length}</span>
        </button>
      </nav>

      {activeTab === "overview" ? (
        <div className="relative min-h-[calc(100dvh-118px)]">
          <StaffOverview
            reports={reports}
            loading={loading}
            onSelectReport={openReportDetail}
            onOpenReports={() => setActiveTab("reports")}
          />
          {detailOpen ? (
            <>
              <button
                type="button"
                aria-label="Close report details"
                onClick={() => setDetailOpen(false)}
                className="fixed inset-0 z-30 cursor-default bg-[#183e32]/20 backdrop-blur-[1px]"
              />
              <div role="dialog" aria-label="Report details" className="fixed inset-x-0 bottom-0 z-40 max-h-[92dvh] overflow-y-auto rounded-t-2xl border border-[#d8e3da] bg-[#fbfcfa] shadow-[0_-12px_36px_rgba(24,62,50,0.18)] lg:inset-y-0 lg:left-auto lg:right-0 lg:top-0 lg:w-[440px] lg:rounded-none lg:border-y-0 lg:border-r-0 lg:border-l lg:shadow-[-12px_0_36px_rgba(24,62,50,0.12)]">
                <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e2e8e2] bg-white px-4 py-3">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#71867a]">Report details</span>
                  <button type="button" onClick={() => setDetailOpen(false)} className="min-h-10 rounded-lg border border-[#d3dfd5] px-3 text-[11px] font-semibold text-[#426453]">Close</button>
                </div>
                <StaffEvidence
                  report={selectedReport}
                  actionBusy={actionBusy}
                  actionMessage={actionMessage}
                  actionError={actionError}
                  priorityDraft={priorityDraft}
                  priorityNote={priorityNote}
                  inspectionNote={inspectionNote}
                  responseType={responseType}
                  responseNote={responseNote}
                  obstructionLevel={obstructionLevel}
                  obstructionTarget={obstructionTarget}
                  obstructionNote={obstructionNote}
                  resolutionNote={resolutionNote}
                  onPriorityDraftChange={setPriorityDraft}
                  onPriorityNoteChange={setPriorityNote}
                  onInspectionNoteChange={setInspectionNote}
                  onResponseTypeChange={setResponseType}
                  onResponseNoteChange={setResponseNote}
                  onObstructionLevelChange={setObstructionLevel}
                  onObstructionTargetChange={setObstructionTarget}
                  onObstructionNoteChange={setObstructionNote}
                  onResolutionNoteChange={setResolutionNote}
                  onAction={(type) => void performAction(type)}
                  onRetry={() => {
                    if (lastAction) void performAction(lastAction);
                  }}
                />
              </div>
            </>
          ) : null}
        </div>
      ) : (
        <div className={[
          "grid min-h-[calc(100dvh-118px)] lg:h-[calc(100dvh-118px)] lg:overflow-hidden",
          evidenceCollapsed
            ? "lg:grid-cols-[320px_minmax(420px,1fr)_48px]"
            : "lg:grid-cols-[320px_minmax(420px,1fr)_420px]",
        ].join(" ")}>
          <StaffQueue
            reports={reports}
            visibleReports={visibleReports}
            selectedId={resolvedSelectedId}
            search={search}
            statusFilter={statusFilter}
            priorityFilter={priorityFilter}
            onSearchChange={setSearch}
            onStatusFilterChange={setStatusFilter}
            onPriorityFilterChange={setPriorityFilter}
            onSelect={handleSelect}
          />
          <StaffMap
            reports={visibleReports}
            selectedId={resolvedSelectedId}
            showScenario={showScenario}
            showPopulationDensity={showPopulationDensity}
            onSelect={handleSelect}
            onToggleScenario={() => setShowScenario((value) => !value)}
            onTogglePopulationDensity={() => setShowPopulationDensity((value) => !value)}
          />
          {evidenceCollapsed ? (
            <aside className="flex min-h-[540px] items-start justify-center border-l border-[#dfe6df] bg-[#fbfcfa] pt-4 lg:min-h-0">
              <button
                type="button"
                aria-expanded="false"
                onClick={() => setEvidenceCollapsed(false)}
                className="min-h-11 rounded-lg border border-[#d5e1d7] bg-white px-2 text-[10px] font-semibold text-[#426453] [writing-mode:vertical-rl] hover:bg-[#f2f8f2]"
              >
                Open details
              </button>
            </aside>
          ) : (
            <div className="relative min-h-0 min-w-0 overflow-y-auto">
              <button
                type="button"
                aria-expanded="true"
                onClick={() => setEvidenceCollapsed(true)}
                className="absolute right-3 top-3 z-10 min-h-9 rounded-lg border border-[#d5e1d7] bg-white/90 px-2.5 text-[10px] font-semibold text-[#426453] shadow-sm backdrop-blur hover:bg-[#f2f8f2]"
              >
                Hide details
              </button>
              <StaffEvidence
                report={selectedReport}
                actionBusy={actionBusy}
                actionMessage={actionMessage}
                actionError={actionError}
                priorityDraft={priorityDraft}
                priorityNote={priorityNote}
                inspectionNote={inspectionNote}
                responseType={responseType}
                responseNote={responseNote}
                obstructionLevel={obstructionLevel}
                obstructionTarget={obstructionTarget}
                obstructionNote={obstructionNote}
                resolutionNote={resolutionNote}
                onPriorityDraftChange={setPriorityDraft}
                onPriorityNoteChange={setPriorityNote}
                onInspectionNoteChange={setInspectionNote}
                onResponseTypeChange={setResponseType}
                onResponseNoteChange={setResponseNote}
                onObstructionLevelChange={setObstructionLevel}
                onObstructionTargetChange={setObstructionTarget}
                onObstructionNoteChange={setObstructionNote}
                onResolutionNoteChange={setResolutionNote}
                onAction={(type) => void performAction(type)}
                onRetry={() => {
                  if (lastAction) void performAction(lastAction);
                }}
              />
            </div>
          )}
        </div>
      )}
    </main>
  );
}
