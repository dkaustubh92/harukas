"use client";

import Link from "next/link";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ReportStatus =
  | "submitted"
  | "reviewed"
  | "inspection_requested"
  | "response_assigned"
  | "resolved";

type PriorityLevel = "urgent" | "priority" | "routine" | "unassessed";

type JsonRecord = Record<string, unknown>;

type ReportPhoto = {
  url: string | null;
  alt: string | null;
};

type ReportLocation = {
  label: string;
  latitude: number | null;
  longitude: number | null;
};

type CitizenDetails = {
  title: string;
  category: string | null;
  observations: string | null;
  targets: string[];
  obstruction: string | null;
  cause: string | null;
  utilityConcern: string | null;
  immediateDanger: string | null;
  damageAboveTarget: string | null;
};

type PriorityValue = {
  level: PriorityLevel;
};

type ReportEvent = {
  type: string;
  timestamp: string | null;
};

type PublicReport = {
  id: string;
  reference: string;
  createdAt: string | null;
  updatedAt: string | null;
  location: ReportLocation;
  photo: ReportPhoto;
  citizenDetails: CitizenDetails;
  status: ReportStatus;
  reviewedObstruction: {
    level: string | null;
    target: string | null;
    reviewedAt: string | null;
  };
  suggestedPriority: PriorityValue | null;
  officerPriority: PriorityValue | null;
  effectivePriority: PriorityValue | null;
  events: ReportEvent[];
};

type FetchResult =
  | { kind: "success"; report: PublicReport; fromFallback: boolean }
  | { kind: "not-found" }
  | { kind: "failure"; message: string };

type TimelineStep = {
  key: ReportStatus;
  label: string;
  pendingLabel: string;
  description: string;
};

const STATUS_RANK: Record<ReportStatus, number> = {
  submitted: 1,
  reviewed: 2,
  inspection_requested: 3,
  response_assigned: 4,
  resolved: 5,
};

const STATUS_COPY: Record<ReportStatus, { label: string; description: string }> = {
  submitted: {
    label: "Submitted · Demo",
    description: "Your report is saved in the HaruKas demo queue.",
  },
  reviewed: {
    label: "Reviewed · Demo",
    description: "An officer has reviewed this demo report.",
  },
  inspection_requested: {
    label: "Inspection requested · Demo",
    description: "A demo inspection response has been recorded.",
  },
  response_assigned: {
    label: "Response assigned · Demo",
    description: "A simulated response has been assigned in HaruKas.",
  },
  resolved: {
    label: "Resolved · Demo",
    description: "This demo report has been marked resolved.",
  },
};

const TIMELINE_STEPS: TimelineStep[] = [
  {
    key: "submitted",
    label: "Report submitted",
    pendingLabel: "Report submission",
    description: "Your photo and details are saved in HaruKas.",
  },
  {
    key: "reviewed",
    label: "Officer review",
    pendingLabel: "Officer review",
    description: "A demo officer reviews the evidence and reported details.",
  },
  {
    key: "inspection_requested",
    label: "Inspection requested",
    pendingLabel: "Inspection request",
    description: "A demo inspection request is recorded when selected.",
  },
  {
    key: "response_assigned",
    label: "Response assigned",
    pendingLabel: "Response assignment",
    description: "A simulated response is assigned inside HaruKas.",
  },
  {
    key: "resolved",
    label: "Demo resolved",
    pendingLabel: "Demo resolution",
    description: "The officer marks the demonstration report resolved.",
  },
];

const CATEGORY_LABELS: Record<string, string> = {
  tree_damage: "Tree damage",
  access_obstruction: "Access obstruction",
  utility_conflict: "Possible utility conflict",
  other_unsure: "Other or unsure",
};

const ANSWER_LABELS: Record<string, string> = {
  yes: "Yes",
  no: "No",
  unknown: "Unknown",
  none: "None reported",
  partial: "Partial",
  full: "Full",
};

const TARGET_LABELS: Record<string, string> = {
  road: "Road",
  sidewalk: "Sidewalk",
  bus_stop: "Bus stop",
  playground: "Playground",
  building: "Building",
  driveway: "Driveway",
  other: "Other",
  unknown: "Unknown",
};

const PRIORITY_LABELS: Record<PriorityLevel, string> = {
  urgent: "Urgent review",
  priority: "Priority review",
  routine: "Routine review",
  unassessed: "Needs assessment",
};

const PRIORITY_TONES: Record<PriorityLevel, string> = {
  urgent: "border-[#e4b8b0] bg-[#fff4f1] text-[#8a3428]",
  priority: "border-[#e7c998] bg-[#fff8ec] text-[#835512]",
  routine: "border-[#cfdad4] bg-[#f4f8f5] text-[#456457]",
  unassessed: "border-[#c7d6e2] bg-[#f1f6fa] text-[#3f627a]",
};

const EVENT_ALIASES: Record<ReportStatus, string[]> = {
  submitted: ["submitted", "created", "citizen_submit", "report_submit"],
  reviewed: ["reviewed", "review", "mark_review", "officer_review", "obstruction_mark", "mark_obstruction"],
  inspection_requested: ["inspection_requested", "request_inspection", "inspection"],
  response_assigned: ["response_assigned", "assign_response", "simulate_response", "assigned"],
  resolved: ["resolved", "resolve", "demo_resolution", "resolution"],
};

function isRecord(value: unknown): value is JsonRecord {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function stringValue(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function numberValue(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function firstString(...values: unknown[]): string | null {
  for (const value of values) {
    const result = stringValue(value);
    if (result) return result;
  }
  return null;
}

function answerValue(value: unknown): string | null {
  const result = stringValue(value)?.toLowerCase();
  return result || null;
}

function normalizeStatus(value: unknown): ReportStatus | null {
  const status = stringValue(value)?.toLowerCase();
  if (status === "submitted") return "submitted";
  if (status === "reviewed") return "reviewed";
  if (status === "inspection_requested") return "inspection_requested";
  if (status === "response_assigned") return "response_assigned";
  if (status === "resolved") return "resolved";
  return null;
}

function normalizePriority(value: unknown): PriorityValue | null {
  const level = isRecord(value) ? value.level : value;
  const normalized = stringValue(level)?.toLowerCase();
  if (
    normalized === "urgent" ||
    normalized === "priority" ||
    normalized === "routine" ||
    normalized === "unassessed"
  ) {
    return { level: normalized };
  }
  return null;
}

function unwrapReport(value: unknown): unknown {
  if (!isRecord(value)) return value;
  if (isRecord(value.report)) return value.report;
  if (isRecord(value.data) && isRecord(value.data.report)) return value.data.report;
  if (isRecord(value.data)) return value.data;
  return value;
}

function normalizeReport(value: unknown, requestedId: string): PublicReport | null {
  const source = unwrapReport(value);
  if (!isRecord(source)) return null;

  const id = firstString(source.id, source.reportId, source.uuid);
  const reference = firstString(source.reference, source.reportReference, source.ref);
  if (!id || !reference) return null;
  if (id !== requestedId && reference !== requestedId) return null;

  const locationSource = isRecord(source.location)
    ? source.location
    : isRecord(source.coordinates)
      ? source.coordinates
      : {};
  const detailsSource = isRecord(source.citizenDetails)
    ? source.citizenDetails
    : isRecord(source.details)
      ? source.details
      : {};
  const photoSource = isRecord(source.photo) ? source.photo : {};
  const obstructionSource = isRecord(source.reviewedObstruction)
    ? source.reviewedObstruction
    : isRecord(source.publicObstruction)
      ? source.publicObstruction
      : {};

  const rawTargets = detailsSource.targets;
  const targets = Array.isArray(rawTargets)
    ? rawTargets.map((target) => stringValue(target)).filter((target): target is string => Boolean(target))
    : stringValue(rawTargets)
      ? [stringValue(rawTargets) as string]
      : [];

  const rawEvents = Array.isArray(source.events)
    ? source.events
    : Array.isArray(source.timeline)
      ? source.timeline
      : [];
  const events: ReportEvent[] = rawEvents
    .filter(isRecord)
    .map((event) => ({
      type: firstString(event.type, event.action, event.kind, event.name) ?? "update",
      timestamp: firstString(event.timestamp, event.createdAt, event.at, event.occurredAt),
    }));

  const status = normalizeStatus(source.status);
  if (!status) return null;

  const normalizedId = id;
  return {
    id: normalizedId,
    reference: reference ?? normalizedId,
    createdAt: firstString(source.createdAt, source.created_at, source.submittedAt),
    updatedAt: firstString(source.updatedAt, source.updated_at, source.modifiedAt),
    location: {
      label:
        firstString(
          locationSource.label,
          locationSource.address,
          locationSource.landmark,
          source.locationLabel,
        ) ?? "Pinned Halifax location",
      latitude: numberValue(locationSource.latitude ?? locationSource.lat),
      longitude: numberValue(locationSource.longitude ?? locationSource.lng ?? locationSource.lon),
    },
    photo: {
      url: firstString(
        photoSource.url,
        photoSource.accessUrl,
        photoSource.publicUrl,
        photoSource.signedUrl,
        source.photoUrl,
      ),
      alt: firstString(photoSource.alt, photoSource.description),
    },
    citizenDetails: {
      title: firstString(detailsSource.title, source.title) ?? "Tree incident report",
      category: firstString(detailsSource.category, source.category),
      observations: firstString(detailsSource.observations, detailsSource.description, source.observations),
      targets,
      obstruction: answerValue(detailsSource.obstruction ?? source.obstruction),
      cause: answerValue(detailsSource.cause ?? source.cause),
      utilityConcern: answerValue(detailsSource.utilityConcern ?? source.utilityConcern),
      immediateDanger: answerValue(detailsSource.immediateDanger ?? source.immediateDanger),
      damageAboveTarget: answerValue(detailsSource.damageAboveTarget ?? source.damageAboveTarget),
    },
    status,
    reviewedObstruction: {
      level: firstString(obstructionSource.level, obstructionSource.type),
      target: firstString(obstructionSource.target),
      reviewedAt: firstString(obstructionSource.reviewedAt, obstructionSource.reviewed_at),
    },
    suggestedPriority: normalizePriority(source.suggestedPriority),
    officerPriority: normalizePriority(source.officerPriority),
    effectivePriority: normalizePriority(
      source.effectivePriority ?? source.displayedPriority ?? source.officerPriority ?? source.suggestedPriority,
    ),
    events,
  };
}

function collectFallbackCandidates(value: unknown, candidates: unknown[] = []): unknown[] {
  if (Array.isArray(value)) {
    for (const entry of value) collectFallbackCandidates(entry, candidates);
    return candidates;
  }
  if (!isRecord(value)) return candidates;
  candidates.push(value);
  for (const key of ["report", "data", "reports", "savedReports", "items", "payload"]) {
    if (key in value) collectFallbackCandidates(value[key], candidates);
  }
  return candidates;
}

function readLocalFallback(requestedId: string): PublicReport | null {
  if (typeof window === "undefined") return null;

  const rawValues: unknown[] = [];
  const likelyKeys = new Set([
    `harukas:report:${requestedId}`,
    `harukas-report:${requestedId}`,
    `harukas-report-${requestedId}`,
    `demo-report:${requestedId}`,
    `report:${requestedId}`,
    "harukas:local-reports",
    "harukas:reports",
    "harukas-reports",
    "harukas.demo.reports",
    "reports",
    "demoReports",
  ]);

  try {
    for (const key of likelyKeys) {
      const raw = window.localStorage.getItem(key);
      if (raw) rawValues.push(JSON.parse(raw) as unknown);
    }
    for (let index = 0; index < window.localStorage.length; index += 1) {
      const key = window.localStorage.key(index);
      if (!key || likelyKeys.has(key)) continue;
      const normalizedKey = key.toLowerCase();
      if (!normalizedKey.includes("harukas") && !normalizedKey.includes("report")) continue;
      const raw = window.localStorage.getItem(key);
      if (raw) rawValues.push(JSON.parse(raw) as unknown);
    }
  } catch {
    return null;
  }

  const candidates = rawValues.flatMap((value) => collectFallbackCandidates(value));
  const normalized = candidates
    .map((candidate) => normalizeReport(candidate, requestedId))
    .filter((candidate): candidate is PublicReport => Boolean(candidate));

  return normalized.find((candidate) => candidate.id === requestedId || candidate.reference === requestedId) ?? null;
}

function friendlyFetchMessage(status?: number): string {
  if (status === 429) return "The demo service is busy. Try again in a moment.";
  if (status && status >= 500) return "The shared report service is unavailable right now.";
  return "We couldn’t refresh this report. Check your connection and try again.";
}

async function fetchReport(reportId: string, signal?: AbortSignal): Promise<FetchResult> {
  try {
    const response = await fetch(`/api/reports/${encodeURIComponent(reportId)}`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
      signal,
    });

    if (response.status === 404) {
      let notFoundPayload: unknown = null;
      try {
        notFoundPayload = (await response.json()) as unknown;
      } catch {
        // A framework-level 404 is commonly HTML. Give the browser cache a chance
        // before presenting a not-found state when the API route is unavailable.
      }
      const errorEnvelope = isRecord(notFoundPayload) && isRecord(notFoundPayload.error)
        ? notFoundPayload.error
        : null;
      const errorCode = errorEnvelope ? stringValue(errorEnvelope.code) : null;
      if (errorCode === "report_not_found") return { kind: "not-found" };
      const fallback = readLocalFallback(reportId);
      if (fallback) return { kind: "success", report: fallback, fromFallback: true };
      return { kind: "not-found" };
    }

    let payload: unknown = null;
    try {
      payload = (await response.json()) as unknown;
    } catch {
      if (!response.ok) return { kind: "failure", message: friendlyFetchMessage(response.status) };
    }

    if (!response.ok) {
      const fallback = readLocalFallback(reportId);
      if (fallback) return { kind: "success", report: fallback, fromFallback: true };
      return { kind: "failure", message: friendlyFetchMessage(response.status) };
    }

    const report = normalizeReport(payload, reportId);
    if (!report) {
      const fallback = readLocalFallback(reportId);
      if (fallback) return { kind: "success", report: fallback, fromFallback: true };
      return { kind: "failure", message: "The saved report returned an unreadable response." };
    }
    return { kind: "success", report, fromFallback: false };
  } catch (error) {
    if (error instanceof DOMException && error.name === "AbortError") throw error;
    const fallback = readLocalFallback(reportId);
    if (fallback) return { kind: "success", report: fallback, fromFallback: true };
    return { kind: "failure", message: friendlyFetchMessage() };
  }
}

function formatDate(value: string | null, fallback = "Time not available"): string {
  if (!value) return fallback;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(parsed);
}

function formatCoordinate(value: number | null): string | null {
  return value === null ? null : value.toFixed(5);
}

function displayAnswer(value: string | null, fallback = "Unknown") {
  if (!value) return fallback;
  return ANSWER_LABELS[value] ?? value.replaceAll("_", " ");
}

function displayTarget(value: string): string {
  return TARGET_LABELS[value] ?? value.replaceAll("_", " ");
}

function eventMatches(event: ReportEvent, step: ReportStatus): boolean {
  const type = event.type.toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");
  return EVENT_ALIASES[step].some((alias) => type.includes(alias));
}

function eventForStep(events: ReportEvent[], step: ReportStatus): ReportEvent | null {
  return events.find((event) => eventMatches(event, step)) ?? null;
}

function stepComplete(report: PublicReport, step: ReportStatus): boolean {
  if (step === "submitted") return true;
  if (STATUS_RANK[report.status] >= STATUS_RANK[step]) return true;
  return Boolean(eventForStep(report.events, step));
}

function stepTimestamp(report: PublicReport, step: ReportStatus): string | null {
  const event = eventForStep(report.events, step);
  if (event?.timestamp) return event.timestamp;
  if (step === "submitted") return report.createdAt;
  if (step === "reviewed") return report.reviewedObstruction.reviewedAt;
  return null;
}

function ArrowLeftIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M15.5 10H4.5M9 4.5 3.5 10 9 15.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowUpRightIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M5.2 14.8 14.8 5.2M7 5h8v8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4" fill="none" stroke="currentColor" strokeWidth="2.3">
      <path d="m4.5 10.3 3.4 3.4 7.6-7.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d="M19 10.1c0 5.2-7 10.4-7 10.4S5 15.3 5 10.1a7 7 0 1 1 14 0Z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="10" r="2.3" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg viewBox="0 0 20 20" aria-hidden="true" className="size-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7">
      <circle cx="10" cy="10" r="7.2" />
      <path d="M10 9.2v4.1M10 6.5h.01" strokeLinecap="round" />
    </svg>
  );
}

function LeafMark() {
  return (
    <span className="grid size-9 place-items-center rounded-[13px] bg-[var(--forest)] text-white shadow-[0_8px_20px_rgba(24,62,50,.16)]" aria-hidden="true">
      <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="1.7">
        <path d="M19.5 4.5C11.1 4.5 6.1 7.8 6.1 13c0 2.8 2 5.1 4.9 5.1 5.2 0 8.5-5 8.5-13.6Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M4.7 19.6c2.3-4 5.2-6.1 9.5-8" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function StatusPill({ status }: { status: ReportStatus }) {
  return (
    <span className="inline-flex min-h-8 items-center gap-2 rounded-full border border-[#bdd5c8] bg-[#edf7f0] px-3 py-1 text-xs font-semibold text-[#275e46]">
      <span className="size-1.5 rounded-full bg-[#4b9b70]" aria-hidden="true" />
      {STATUS_COPY[status].label}
    </span>
  );
}

function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-[26px] border border-[var(--line)] bg-[var(--surface)] shadow-[0_12px_35px_rgba(24,62,50,.055)] ${className}`}>
      {children}
    </section>
  );
}

function LoadingState() {
  return (
    <main className="min-h-dvh bg-[var(--background)] px-4 py-6 text-[var(--foreground)] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1120px] animate-pulse space-y-8">
        <div className="h-9 w-48 rounded-full bg-[var(--surface-muted)]" />
        <div className="space-y-3">
          <div className="h-3 w-28 rounded bg-[var(--surface-muted)]" />
          <div className="h-10 max-w-2xl rounded bg-[var(--surface-muted)]" />
          <div className="h-4 max-w-md rounded bg-[var(--surface-muted)]" />
        </div>
        <div className="grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)]">
          <div className="aspect-[4/3] rounded-[26px] bg-[var(--surface-muted)]" />
          <div className="h-[430px] rounded-[26px] bg-[var(--surface-muted)]" />
        </div>
      </div>
    </main>
  );
}

function EmptyState({
  title,
  message,
  onRetry,
  retrying = false,
}: {
  title: string;
  message: string;
  onRetry: () => void;
  retrying?: boolean;
}) {
  return (
    <main className="grid min-h-dvh place-items-center bg-[var(--background)] px-5 py-10 text-[var(--foreground)]">
      <section className="w-full max-w-md rounded-[28px] border border-[var(--line)] bg-[var(--surface)] p-7 text-center shadow-[0_20px_60px_rgba(24,62,50,.08)]">
        <div className="mx-auto grid size-12 place-items-center rounded-2xl bg-[var(--surface-muted)] text-[var(--forest)]">
          <InfoIcon />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-[var(--forest-soft)]">HaruKas demo</p>
        <h1 className="mt-2 text-2xl font-semibold tracking-[-0.03em]">{title}</h1>
        <p className="mt-3 text-sm leading-6 text-[var(--forest-soft)]">{message}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onRetry}
            disabled={retrying}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--forest)] px-5 text-sm font-semibold text-white transition hover:opacity-90 disabled:cursor-wait disabled:opacity-60"
          >
            {retrying ? "Trying again…" : "Try again"}
          </button>
          <Link
            href="/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--line)] px-5 text-sm font-semibold text-[var(--forest)] transition hover:bg-[var(--surface-muted)]"
          >
            Citizen home
          </Link>
        </div>
      </section>
    </main>
  );
}

export default function PublicReportView({ reportId }: { reportId: string }) {
  const [report, setReport] = useState<PublicReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [retrying, setRetrying] = useState(false);
  const [stale, setStale] = useState(false);
  const [fallback, setFallback] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [photoFailed, setPhotoFailed] = useState(false);
  const requestSequence = useRef(0);
  const reportRef = useRef<PublicReport | null>(null);

  const load = useCallback(
    async ({ manual = false } = {}) => {
      const requestNumber = requestSequence.current + 1;
      requestSequence.current = requestNumber;
      if (manual) setRetrying(true);

      try {
        const result = await fetchReport(reportId);
        if (requestNumber !== requestSequence.current) return;

        if (result.kind === "success") {
          reportRef.current = result.report;
          setReport(result.report);
          setFallback(result.fromFallback);
          setNotFound(false);
          setErrorMessage(null);
          setStale(result.fromFallback);
          setLastUpdated(result.report.updatedAt ?? new Date().toISOString());
          setPhotoFailed(false);
        } else if (result.kind === "not-found") {
          setNotFound(true);
          setErrorMessage(null);
          setStale(false);
        } else {
          setErrorMessage(result.message);
          if (reportRef.current) setStale(true);
        }
      } catch {
        // Aborted reads are intentionally silent. The next visibility or poll read retries.
      } finally {
        if (requestNumber === requestSequence.current) {
          setLoading(false);
          setRetrying(false);
        }
      }
    },
    [reportId],
  );

  useEffect(() => {
    let disposed = false;
    const run = () => {
      if (!disposed && !document.hidden) void load();
    };

    const initialLoad = window.setTimeout(() => {
      if (!disposed && !document.hidden) void load();
    }, 0);
    const interval = window.setInterval(run, 5000);
    const onVisibilityChange = () => {
      if (!document.hidden) void load();
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      disposed = true;
      window.clearTimeout(initialLoad);
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [load]);

  const retry = useCallback(() => {
    void load({ manual: true });
  }, [load]);

  const timeline = useMemo(() => {
    if (!report) return [];
    return TIMELINE_STEPS.map((step) => ({
      ...step,
      complete: stepComplete(report, step.key),
      timestamp: stepTimestamp(report, step.key),
    }));
  }, [report]);

  if (loading && !report) return <LoadingState />;

  if (notFound && !report) {
    return (
      <EmptyState
        title="Report not found"
        message="This report link may be incomplete, expired, or not saved yet."
        onRetry={retry}
        retrying={retrying}
      />
    );
  }

  if (!report) {
    return (
      <EmptyState
        title="Couldn’t load this report"
        message={errorMessage ?? "Check your connection and try again. Your report data is not changed."}
        onRetry={retry}
        retrying={retrying}
      />
    );
  }

  const details = report.citizenDetails;
  const statusCopy = STATUS_COPY[report.status];
  const priority = report.effectivePriority ?? report.suggestedPriority;
  const coordinateText = [formatCoordinate(report.location.latitude), formatCoordinate(report.location.longitude)]
    .filter(Boolean)
    .join(", ");
  const dangerReported = details.immediateDanger === "yes" || details.utilityConcern === "yes";
  const reportedObstruction = report.reviewedObstruction.level && report.reviewedObstruction.level !== "none";

  return (
    <main className="min-h-dvh bg-[var(--background)] px-4 pb-12 pt-5 text-[var(--foreground)] sm:px-6 sm:pt-7 lg:px-8">
      <div className="mx-auto max-w-[1120px]">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <Link href="/" className="inline-flex min-h-11 items-center gap-3 rounded-full pr-2 text-sm font-semibold text-[var(--forest)] transition hover:opacity-75">
            <LeafMark />
            <span>HaruKas</span>
          </Link>
          <nav aria-label="Demo navigation" className="flex items-center gap-1 rounded-full border border-[var(--line)] bg-[var(--surface)] p-1 text-xs font-semibold text-[var(--forest-soft)]">
            <Link href="/" className="inline-flex min-h-9 items-center rounded-full px-3 transition hover:bg-[var(--surface-muted)] hover:text-[var(--forest)]">Citizen home</Link>
            <Link href="/staff" className="inline-flex min-h-9 items-center gap-1 rounded-full px-3 transition hover:bg-[var(--surface-muted)] hover:text-[var(--forest)]">Officer demo <ArrowUpRightIcon /></Link>
          </nav>
        </header>

        <div className="mt-9 flex flex-col gap-5 sm:mt-12">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--forest-soft)]">
            <span>Saved report</span>
            <span className="text-[#a5b4aa]" aria-hidden="true">/</span>
            <span className="font-mono tracking-[0.08em] text-[var(--forest)]">{report.reference}</span>
            {fallback && <span className="rounded-full bg-[#fff7e6] px-2.5 py-1 text-[10px] tracking-[0.08em] text-[#875d1c]">Browser demo copy</span>}
          </div>

          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <h1 className="text-[clamp(2rem,5vw,3.35rem)] font-semibold leading-[1.03] tracking-[-0.055em] text-[var(--forest)]">
                {details.title}
              </h1>
              <p className="mt-3 max-w-xl text-[15px] leading-7 text-[var(--forest-soft)]">
                {statusCopy.description}
              </p>
            </div>
            <StatusPill status={report.status} />
          </div>

          <div className="flex flex-col gap-3" aria-live="polite">
            <div className="flex items-start gap-3 rounded-2xl border border-[#bad4c4] bg-[#eff8f1] px-4 py-3 text-sm text-[#295b45]">
              <InfoIcon />
              <p><strong className="font-semibold">Not sent to Halifax.</strong> This saved report and every status below are part of the HaruKas demonstration.</p>
            </div>
            {stale && (
              <div className="flex flex-col gap-3 rounded-2xl border border-[#e6d2aa] bg-[#fff9ed] px-4 py-3 text-sm text-[#76541c] sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-start gap-3"><InfoIcon /><span><strong className="font-semibold">Live status is paused.</strong> Showing the last saved update{lastUpdated ? ` from ${formatDate(lastUpdated)}` : ""}.</span></p>
                <button type="button" onClick={retry} disabled={retrying} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-[#d7bc83] px-4 text-xs font-semibold transition hover:bg-[#fff3d5] disabled:opacity-50">{retrying ? "Refreshing…" : "Refresh status"}</button>
              </div>
            )}
            {!stale && errorMessage && (
              <div className="flex flex-col gap-3 rounded-2xl border border-[#e6d2aa] bg-[#fff9ed] px-4 py-3 text-sm text-[#76541c] sm:flex-row sm:items-center sm:justify-between">
                <p className="flex items-start gap-3"><InfoIcon /><span>{errorMessage}</span></p>
                <button type="button" onClick={retry} disabled={retrying} className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-full border border-[#d7bc83] px-4 text-xs font-semibold transition hover:bg-[#fff3d5] disabled:opacity-50">{retrying ? "Refreshing…" : "Try again"}</button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-7 grid gap-5 lg:grid-cols-[minmax(0,1.05fr)_minmax(360px,.95fr)] lg:items-start">
          <div className="space-y-5">
            <Card className="overflow-hidden">
              <div className="relative aspect-[4/3] min-h-[260px] overflow-hidden bg-[#e8eee8] sm:min-h-[340px]">
                {report.photo.url && !photoFailed ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={report.photo.url}
                    alt={report.photo.alt ?? `Citizen photo for ${details.title}`}
                    className="size-full object-cover"
                    onError={() => setPhotoFailed(true)}
                  />
                ) : (
                  <div className="grid size-full place-items-center bg-[radial-gradient(circle_at_30%_20%,#f6faf5,transparent_38%),linear-gradient(135deg,#dfeadf,#eef3ed)] p-8 text-center">
                    <div>
                      <div className="mx-auto grid size-14 place-items-center rounded-2xl bg-white/75 text-[var(--forest)] shadow-sm">
                        <svg viewBox="0 0 24 24" aria-hidden="true" className="size-7" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="3.5" y="4.5" width="17" height="15" rx="2.2" />
                          <circle cx="8.5" cy="9" r="1.4" />
                          <path d="m5.5 17 4.2-4 3 2.7 2.2-2 3.6 3.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                      <p className="mt-4 text-sm font-semibold text-[var(--forest)]">Photo unavailable</p>
                      <p className="mt-1 text-xs text-[var(--forest-soft)]">The report status is still available.</p>
                    </div>
                  </div>
                )}
                <div className="absolute left-4 top-4 rounded-full border border-white/70 bg-white/85 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-[var(--forest)] shadow-sm backdrop-blur-sm">
                  Citizen photo
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 sm:px-6">
                <p className="text-xs text-[var(--forest-soft)]">One photo attached to this demo report.</p>
                <span className="rounded-full bg-[var(--surface-muted)] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[var(--forest-soft)]">Demo evidence</span>
              </div>
            </Card>

            <Card className="p-5 sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--forest-soft)]">Pinned location</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--forest)]">{report.location.label}</h2>
                </div>
                <span className="grid size-10 shrink-0 place-items-center rounded-2xl bg-[var(--surface-muted)] text-[var(--forest)]"><PinIcon /></span>
              </div>
              <div className="mt-5 overflow-hidden rounded-2xl border border-[#d5e0d5] bg-[radial-gradient(circle_at_50%_48%,rgba(255,255,255,.85),transparent_1px),linear-gradient(120deg,#e7efe8,#dce9e5)] bg-[length:18px_18px,100%_100%] p-5">
                <div className="flex min-h-24 items-center justify-center">
                  <div className="relative grid size-12 place-items-center rounded-full border-4 border-white bg-[#3c8060] text-white shadow-[0_8px_20px_rgba(38,86,62,.25)]">
                    <PinIcon />
                    <span className="absolute -bottom-5 h-3 w-3 rounded-full bg-[#3c8060]/25 blur-[2px]" aria-hidden="true" />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[var(--forest-soft)]">
                <span>Tree pin confirmed</span>
                {coordinateText && <span className="font-mono text-[11px]">{coordinateText}</span>}
              </div>
            </Card>
          </div>

          <div className="space-y-5">
            <Card className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--forest-soft)]">Your report</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--forest)]">What you told us</h2>
                </div>
                {priority && (
                  <span className={`rounded-full border px-3 py-1.5 text-xs font-semibold ${PRIORITY_TONES[priority.level]}`}>
                    {PRIORITY_LABELS[priority.level]}
                  </span>
                )}
              </div>
              <dl className="mt-6 divide-y divide-[var(--line)]">
                <div className="grid gap-1 py-3 first:pt-0 sm:grid-cols-[130px_1fr] sm:gap-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--forest-soft)]">Category</dt>
                  <dd className="text-sm font-medium text-[var(--forest)]">{details.category ? CATEGORY_LABELS[details.category] ?? details.category.replaceAll("_", " ") : "Other or unsure"}</dd>
                </div>
                <div className="grid gap-1 py-3 sm:grid-cols-[130px_1fr] sm:gap-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--forest-soft)]">Nearby target</dt>
                  <dd className="text-sm font-medium text-[var(--forest)]">{details.targets.length ? details.targets.map(displayTarget).join(", ") : "Unknown"}</dd>
                </div>
                <div className="grid gap-1 py-3 sm:grid-cols-[130px_1fr] sm:gap-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--forest-soft)]">Obstruction</dt>
                  <dd className="text-sm font-medium text-[var(--forest)]">{displayAnswer(details.obstruction)}</dd>
                </div>
                <div className="grid gap-1 py-3 sm:grid-cols-[130px_1fr] sm:gap-4">
                  <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--forest-soft)]">Reported danger</dt>
                  <dd className="text-sm font-medium text-[var(--forest)]">{displayAnswer(details.immediateDanger)}</dd>
                </div>
              </dl>
              {details.observations && (
                <div className="mt-4 rounded-2xl bg-[var(--surface-muted)] p-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--forest-soft)]">Your observation</p>
                  <p className="mt-2 text-sm leading-6 text-[var(--forest)]">{details.observations}</p>
                </div>
              )}
              {reportedObstruction && (
                <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[#e5c9ac] bg-[#fff7ee] p-4 text-sm text-[#774a24]">
                  <InfoIcon />
                  <p><strong className="font-semibold">Reported obstruction · Demo.</strong> Staff marked a {displayAnswer(report.reviewedObstruction.level)} obstruction near the pinned location. This is not an official closure.</p>
                </div>
              )}
            </Card>

            {dangerReported && (
              <Card className="border-[#e3c3b8] bg-[#fff8f5] p-5 sm:p-6">
                <div className="flex items-start gap-3 text-[#7f382c]">
                  <span className="grid size-9 shrink-0 place-items-center rounded-xl bg-[#f6ddd6] font-semibold">!</span>
                  <div>
                    <h2 className="text-sm font-semibold">If you see downed wires or immediate danger</h2>
                    <p className="mt-1.5 text-sm leading-6">Stay at least 20 metres away and call 911. HaruKas does not call emergency services or notify Nova Scotia Power.</p>
                  </div>
                </div>
              </Card>
            )}

            <Card className="p-5 sm:p-6">
              <div className="flex flex-wrap items-end justify-between gap-3">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--forest-soft)]">Progress</p>
                  <h2 className="mt-2 text-xl font-semibold tracking-[-0.03em] text-[var(--forest)]">Demo status timeline</h2>
                </div>
                <p className="text-xs text-[var(--forest-soft)]">Updates while this page is open</p>
              </div>
              <ol className="mt-6">
                {timeline.map((step, index) => {
                  const current = step.complete && (index === timeline.length - 1 || !timeline[index + 1]?.complete);
                  return (
                    <li key={step.key} className="relative flex gap-3 pb-6 last:pb-0">
                      {index < timeline.length - 1 && <span className={`absolute left-[13px] top-7 h-[calc(100%-12px)] w-px ${step.complete ? "bg-[#9bc3aa]" : "bg-[#dbe3dd]"}`} aria-hidden="true" />}
                      <span className={`relative z-10 grid size-7 shrink-0 place-items-center rounded-full border ${step.complete ? "border-[#8dbea0] bg-[#edf7f0] text-[#2d7250]" : "border-[#d8e0d9] bg-[var(--surface)] text-[#9aa9a0]"}`}>
                        {step.complete ? <CheckIcon /> : <span className="size-2 rounded-full bg-current" aria-hidden="true" />}
                      </span>
                      <div className="min-w-0 flex-1 pt-0.5">
                        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                          <p className={`text-sm font-semibold ${step.complete ? "text-[var(--forest)]" : "text-[var(--forest-soft)]"}`}>{step.complete ? step.label : step.pendingLabel}</p>
                          {step.timestamp && <time dateTime={step.timestamp} className="text-[11px] text-[var(--forest-soft)]">{formatDate(step.timestamp)}</time>}
                        </div>
                        <p className="mt-1 text-xs leading-5 text-[var(--forest-soft)]">{step.complete ? step.description : "Waiting for this demo step."}</p>
                        {current && <span className="mt-2 inline-flex rounded-full bg-[#edf7f0] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-[#2d7250]">Current status</span>}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </Card>
          </div>
        </div>

        <footer className="mt-8 flex flex-col gap-4 border-t border-[var(--line)] pt-5 text-xs text-[var(--forest-soft)] sm:flex-row sm:items-center sm:justify-between">
          <p>Reference <span className="font-mono text-[var(--forest)]">{report.reference}</span> · Saved {formatDate(report.createdAt)}</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/" className="inline-flex items-center gap-1 font-semibold text-[var(--forest)] hover:underline"><ArrowLeftIcon /> Citizen home</Link>
            <Link href="/staff" className="inline-flex items-center gap-1 font-semibold text-[var(--forest)] hover:underline">Officer demo <ArrowUpRightIcon /></Link>
          </div>
        </footer>
      </div>
    </main>
  );
}
