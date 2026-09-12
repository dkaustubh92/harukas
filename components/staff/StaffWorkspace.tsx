"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { StaffEvidence, type ResponseType } from "./StaffEvidence";
import { StaffMap } from "./StaffMap";
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
        if (a.source === "citizen" && b.source !== "citizen") return -1;
        if (b.source === "citizen" && a.source !== "citizen") return 1;
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

      <div className="grid min-h-[calc(100dvh-4rem)] lg:h-[calc(100dvh-4rem)] lg:grid-cols-[320px_minmax(420px,1fr)_420px] lg:overflow-hidden">
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
          onSelect={handleSelect}
          onToggleScenario={() => setShowScenario((value) => !value)}
        />
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
    </main>
  );
}
