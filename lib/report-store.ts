import "server-only";
import { randomUUID } from "node:crypto";
import { createDemoIncidents } from "./demo-incidents";
import { ReportError } from "./report-errors";
import { getReportPersistence } from "./report-supabase";
export { ReportError } from "./report-errors";
import {
  REPORT_PRIORITIES, REPORT_STATUSES, DEMO_STORE_META,
  type Report, type PublicReport, type ReportAction,
} from "./report-contract";

type Store = {
  reports: Map<string, Report>;
  completedActions: Map<string, { input: string; report: Report }>;
  photos?: Map<string, Uint8Array>;
};

function seedReports(): Report[] {
  return createDemoIncidents().map((seed) => ({
    ...seed,
    effectivePriority: seed.suggestedPriority.level,
    municipalStatus: "not_sent",
    events: [{
      id: `${seed.id}-seed`, actionId: `${seed.id}-seed`,
      type: "seeded", createdAt: seed.updatedAt,
      label: "Authored demo scenario", note: "Fictional existing report loaded for demonstration.",
      version: seed.version, isDemo: true,
    }],
  }));
}

async function persistentStore() {
  const db = getReportPersistence();
  if (db) await db.seed(seedReports());
  return db;
}

export function reportStoreMeta() {
  return getReportPersistence() ? {
    ...DEMO_STORE_META, storage: "supabase",
    persistence: "Reports and uploaded photos are stored in the shared Supabase demo project.",
  } : DEMO_STORE_META;
}

// Without a server key, keep the existing single-server demo store intact.
const globalStore = globalThis as typeof globalThis & { harukasReportStoreV1?: Store };
function store(): Store {
  if (!globalStore.harukasReportStoreV1) {
    globalStore.harukasReportStoreV1 = {
      reports: new Map(seedReports().map((report) => [report.id, report])),
      completedActions: new Map(),
    };
  }
  return globalStore.harukasReportStoreV1;
}

export function publicReport(report: Report): PublicReport {
  // Explicit projection: authored analysis, impact and staff notes never leak
  // through the default public list, detail, or citizen-creation responses.
  return {
    id: report.id, reference: report.reference,
    clientSubmissionId: report.clientSubmissionId,
    createdAt: report.createdAt, updatedAt: report.updatedAt, version: report.version,
    isDemo: true, source: report.source, label: report.label,
    location: structuredClone(report.location), photo: structuredClone(report.photo),
    citizenDetails: structuredClone(report.citizenDetails), status: report.status,
    suggestedPriority: structuredClone(report.suggestedPriority),
    effectivePriority: report.effectivePriority,
    officerPriority: report.officerPriority
      ? { level: report.officerPriority.level, reviewedAt: report.officerPriority.reviewedAt } : null,
    reviewedObstruction: {
      level: report.status === "resolved" ? "none" : report.reviewedObstruction.level,
      target: report.reviewedObstruction.target, reviewedAt: report.reviewedObstruction.reviewedAt,
    },
    response: report.response ? { type: report.response.type, requestedAt: report.response.requestedAt } : null,
    events: report.events.map((event) => ({
      id: event.id, type: event.type, createdAt: event.createdAt,
      label: event.label, version: event.version, isDemo: true,
    })),
    municipalStatus: "not_sent",
  };
}

export async function readReport(id: string): Promise<Report> {
  const persistent = await persistentStore();
  if (persistent) return persistent.read(id);
  const report = store().reports.get(id);
  if (!report) throw new ReportError(404, "report_not_found", "This demo report was not found.");
  return structuredClone(report);
}

export async function saveCitizenReport(report: Report, bytes: Uint8Array) {
  const persistent = await persistentStore();
  if (persistent) {
    const result = await persistent.create(report, bytes);
    return { report: publicReport(result.report), duplicate: result.duplicate };
  }
  const db = store();
  const prior = [...db.reports.values()].find((r) => r.clientSubmissionId === report.clientSubmissionId);
  if (prior) return { report: publicReport(prior), duplicate: true };
  if (db.reports.size >= 100)
    throw new ReportError(400, "demo_capacity", "This demo server has reached its report limit.");
  report.reference = `DEMO-${String(db.reports.size + 1).padStart(3, "0")}`;
  db.photos ??= new Map();
  db.photos.set(report.id, bytes);
  db.reports.set(report.id, report);
  return { report: publicReport(report), duplicate: false };
}

export async function reportPhoto(id: string): Promise<Uint8Array> {
  const persistent = await persistentStore();
  if (persistent) return persistent.photo(id);
  if (!store().reports.has(id))
    throw new ReportError(404, "report_not_found", "This demo report was not found.");
  const photo = store().photos?.get(id);
  if (!photo) throw new ReportError(404, "photo_not_found", "Use the photo URL on this demo report.");
  return photo;
}

export async function listReports(params: URLSearchParams) {
  const status = params.get("status");
  const priority = params.get("priority");
  if (status && status !== "active" && !REPORT_STATUSES.includes(status as Report["status"]))
    throw new ReportError(400, "invalid_filter", "Choose a supported report status.");
  if (priority && !REPORT_PRIORITIES.includes(priority as Report["effectivePriority"]))
    throw new ReportError(400, "invalid_filter", "Choose a supported priority.");
  const staff = params.get("view") === "staff";
  const persistent = await persistentStore();
  const reports = (persistent ? await persistent.list() : [...store().reports.values()])
    .filter((r) => !status || (status === "active" ? r.status !== "resolved" : r.status === status))
    .filter((r) => !priority || r.effectivePriority === priority)
    .sort((a, b) => Number(a.status === "resolved") - Number(b.status === "resolved")
      || REPORT_PRIORITIES.indexOf(a.effectivePriority) - REPORT_PRIORITIES.indexOf(b.effectivePriority)
      || a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id));
  return {
    reports: reports.map((r) => staff ? structuredClone(r) : publicReport(r)),
    meta: { ...reportStoreMeta(), total: reports.length, updatedAt: new Date().toISOString() },
  };
}

export function objectInput(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value))
    throw new ReportError(400, "invalid_input", "Provide a valid request object.");
  return value as Record<string, unknown>;
}

export function textInput(value: unknown, name: string, maximum = 1000): string {
  if (typeof value !== "string" || !value.trim() || value.length > maximum)
    throw new ReportError(400, "invalid_input", `${name} is required and must fit ${maximum} characters.`);
  return value.trim();
}

function actionInput(value: unknown): ReportAction {
  const input = objectInput(value);
  const actionId = textInput(input.actionId, "Action ID", 100);
  if (!Number.isInteger(input.expectedVersion) || Number(input.expectedVersion) < 1)
    throw new ReportError(400, "invalid_version", "Refresh the report and use its current version.");
  if (!["review", "set_priority", "request_inspection", "assign_response", "mark_obstruction", "resolve"].includes(String(input.type)))
    throw new ReportError(400, "invalid_action", "Choose a supported demo action.");
  const action: ReportAction = {
    actionId, expectedVersion: Number(input.expectedVersion), type: input.type as ReportAction["type"],
    note: input.note === undefined || input.note === "" ? "" : textInput(input.note, "Review note"),
  };
  if (action.type === "set_priority") {
    if (!REPORT_PRIORITIES.includes(input.priority as Report["effectivePriority"]))
      throw new ReportError(400, "invalid_priority", "Choose a supported priority.");
    action.priority = input.priority as Report["effectivePriority"];
    action.note = textInput(input.note, "Reason for the priority change");
  }
  if (action.type === "assign_response") {
    if (!["inspection", "clearance", "specialist_review"].includes(String(input.responseType)))
      throw new ReportError(400, "invalid_response", "Choose inspection, clearance, or specialist review.");
    action.responseType = input.responseType as ReportAction["responseType"];
  }
  if (action.type === "mark_obstruction") {
    if (!["none", "partial", "full"].includes(String(input.obstructionLevel)))
      throw new ReportError(400, "invalid_obstruction", "Choose none, partial, or full obstruction.");
    if (input.obstructionLevel !== "none" && !["road", "sidewalk"].includes(String(input.target)))
      throw new ReportError(400, "invalid_target", "Choose road or sidewalk for the reviewed obstruction.");
    action.obstructionLevel = input.obstructionLevel as ReportAction["obstructionLevel"];
    action.target = input.target as ReportAction["target"];
    action.note = textInput(input.note, "Obstruction review note");
  }
  if (action.type === "resolve") action.note = textInput(input.note, "Resolution note");
  return action;
}

export async function applyReportAction(id: string, value: unknown) {
  const action = actionInput(value);
  const persistent = await persistentStore();
  if (persistent) return persistent.action(id, action, transitionReport);
  const db = store();
  const key = `${id}:${action.actionId}`;
  const fingerprint = JSON.stringify(action);
  const prior = db.completedActions.get(key);
  if (prior) {
    if (prior.input !== fingerprint)
      throw new ReportError(409, "action_id_conflict", "This action ID was already used for another update.");
    return { report: structuredClone(prior.report), duplicate: true };
  }
  const saved = db.reports.get(id);
  if (!saved) throw new ReportError(404, "report_not_found", "This demo report was not found.");
  const report = transitionReport(structuredClone(saved), action);
  // No await between the memory version check and commit.
  db.reports.set(id, report);
  db.completedActions.set(key, { input: fingerprint, report: structuredClone(report) });
  return { report: structuredClone(report), duplicate: false };
}

function transitionReport(report: Report, action: ReportAction): Report {
  if (report.version !== action.expectedVersion)
    throw new ReportError(409, "version_conflict", "This report changed. Refresh it before saving your decision.");
  if (report.status === "resolved")
    throw new ReportError(409, "report_resolved", "This demo report is resolved and cannot be changed.");
  const now = new Date().toISOString();
  let label = "Report reviewed · Demo";
  switch (action.type) {
    case "review":
      if (report.status === "submitted") report.status = "reviewed";
      break;
    case "set_priority":
      report.officerPriority = { level: action.priority!, reason: action.note!, reviewedAt: now };
      report.effectivePriority = action.priority!;
      label = "Priority reviewed · Demo";
      break;
    case "request_inspection":
      if (!["submitted", "reviewed", "inspection_requested"].includes(report.status))
        throw new ReportError(409, "invalid_transition", "A response is already assigned. Review the existing response.");
      report.status = "inspection_requested";
      report.response = { type: "inspection", note: action.note || "Inspection requested in the demo.", requestedAt: now };
      label = "Inspection requested · Demo";
      break;
    case "assign_response":
      report.status = "response_assigned";
      report.response = { type: action.responseType!, note: action.note || "Response assignment simulated. No crew was dispatched.", requestedAt: now };
      label = "Response assigned · Demo";
      break;
    case "mark_obstruction":
      if (report.status === "submitted") report.status = "reviewed";
      report.reviewedObstruction = { level: action.obstructionLevel!, target: action.obstructionLevel === "none" ? null : action.target!, note: action.note!, reviewedAt: now };
      label = action.obstructionLevel === "none" ? "Reported obstruction cleared · Demo" : "Reported obstruction reviewed · Demo";
      break;
    case "resolve":
      report.status = "resolved";
      report.reviewedObstruction = { level: "none", target: null, note: action.note!, reviewedAt: now };
      label = "Report resolved · Demo";
      break;
  }
  report.version += 1;
  report.updatedAt = now;
  report.events.push({ id: randomUUID(), actionId: action.actionId, type: action.type, createdAt: now,
    label, note: action.note || "Decision recorded in the demo. No external action was taken.", version: report.version, isDemo: true });
  return report;
}

export function reportResponse(body: unknown, status = 200): Response {
  return Response.json(body, { status, headers: { "Cache-Control": "no-store" } });
}

export function reportErrorResponse(error: unknown): Response {
  if (error instanceof ReportError)
    return reportResponse({ error: { code: error.code, message: error.message, retryable: error.status === 409 || error.status >= 500 } }, error.status);
  if (error instanceof SyntaxError)
    return reportResponse({ error: { code: "invalid_json", message: "Provide valid JSON.", retryable: false } }, 400);
  return reportResponse({ error: { code: "report_unavailable", message: "The demo report service is unavailable. Try again.", retryable: true } }, 500);
}
