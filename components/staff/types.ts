import { createDemoIncidents } from "@/lib/demo-incidents";

export type StaffPriority = "urgent" | "priority" | "routine" | "unassessed";
export type StaffStatus =
  | "submitted"
  | "reviewed"
  | "inspection_requested"
  | "response_assigned"
  | "resolved";
export type StaffAnswer = "yes" | "no" | "unknown";
export type ObstructionLevel = "none" | "partial" | "full";
export type ActionType =
  | "review"
  | "set_priority"
  | "request_inspection"
  | "assign_response"
  | "mark_obstruction"
  | "resolve";

export interface StaffEvent {
  id?: string;
  actionId?: string;
  type?: string;
  timestamp?: string;
  createdAt?: string;
  actor?: string;
  actorLabel?: string;
  note?: string;
  resultingVersion?: number;
}

export interface StaffReport {
  id: string;
  reference: string;
  createdAt: string;
  updatedAt?: string;
  version: number;
  isDemo: boolean;
  source: "seed" | "citizen" | string;
  label?: string;
  location: {
    latitude: number;
    longitude: number;
    label: string;
    method?: string;
    confirmedAt?: string;
    provenance?: {
      roadName?: string;
      source?: string;
      sourceRetrievedAt?: string;
      note?: string;
      [key: string]: unknown;
    };
  };
  photo: {
    url: string;
    alt: string;
    provenance?: {
      note?: string;
      title?: string;
      author?: string;
      sourceUrl?: string;
      [key: string]: unknown;
    };
  };
  citizenDetails: {
    title: string;
    category: string;
    observations: string;
    targets: string[];
    damageAboveTarget: StaffAnswer;
    obstruction: "none" | "partial" | "full" | "unknown";
    cause: string;
    utilityConcern: StaffAnswer;
    immediateDanger: StaffAnswer;
    reviewedAt?: string;
  };
  status: StaffStatus;
  suggestedPriority: {
    level: StaffPriority;
    ruleId: string;
    supportingFields: string[];
    explanation: string;
  };
  officerPriority: {
    level: StaffPriority;
    reason?: string;
    timestamp?: string;
  } | null;
  effectivePriority: StaffPriority;
  reviewedObstruction: {
    level: ObstructionLevel;
    target: string | null;
    note: string;
    reviewedAt: string | null;
  };
  response: {
    type: "inspection" | "clearance" | "specialist_review" | string;
    note: string;
    requestedAt: string;
  } | null;
  analysis: {
    state?: string;
    label?: string;
    originalDraft?: unknown;
    staffSummary?: string;
    possibleImpact?: { illustrative?: boolean; description?: string };
    warnings?: string[];
  };
  context: {
    candidateTree?: unknown;
    nearbyRoad?: unknown;
    missingReasons: string[];
  };
  staffSummary?: string;
  possibleImpact?: string;
  uncertainties: string[];
  events: StaffEvent[];
}

export interface ReportsMeta {
  updatedAt?: string;
  snapshotAt?: string;
  source?: string;
  count?: number;
  [key: string]: unknown;
}

type LooseRecord = Record<string, unknown>;

const PRIORITIES: StaffPriority[] = ["urgent", "priority", "routine", "unassessed"];
const STATUSES: StaffStatus[] = [
  "submitted",
  "reviewed",
  "inspection_requested",
  "response_assigned",
  "resolved",
];

function asRecord(value: unknown): LooseRecord {
  return value && typeof value === "object" ? (value as LooseRecord) : {};
}

function asString(value: unknown, fallback: string): string {
  return typeof value === "string" && value.trim() ? value : fallback;
}

function asOptionalString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim() ? value : undefined;
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((entry): entry is string => typeof entry === "string")
    : [];
}

function asNumber(value: unknown, fallback: number): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asPriority(value: unknown): StaffPriority {
  return PRIORITIES.includes(value as StaffPriority) ? (value as StaffPriority) : "unassessed";
}

function asStatus(value: unknown): StaffStatus {
  return STATUSES.includes(value as StaffStatus) ? (value as StaffStatus) : "submitted";
}

function asAnswer(value: unknown): StaffAnswer {
  return value === "yes" || value === "no" || value === "unknown" ? value : "unknown";
}

function asObstruction(value: unknown): "none" | "partial" | "full" | "unknown" {
  return value === "none" || value === "partial" || value === "full" || value === "unknown"
    ? value
    : "unknown";
}

function asObstructionLevel(value: unknown): ObstructionLevel {
  return value === "partial" || value === "full" || value === "none" ? value : "none";
}

function fallbackPhotoUrl(photoKey: unknown): string {
  const key = asString(photoKey, "street-tree");
  const supported = ["fallen-tree", "broken-branch", "street-tree", "tree-roots", "tree-canopy"];
  return `/demo-incidents/${supported.includes(key) ? key : "street-tree"}.jpg`;
}

/**
 * The API is intentionally allowed to evolve while the staff workspace ships.
 * Keep this adapter at the UI boundary so malformed or older seeded payloads
 * render as an honest, reviewable unassessed report instead of crashing the UI.
 */
export function normalizeStaffReport(value: unknown, index = 0): StaffReport {
  const raw = asRecord(value);
  const location = asRecord(raw.location);
  const citizen = asRecord(raw.citizenDetails);
  const photo = asRecord(raw.photo);
  const analysis = asRecord(raw.analysis);
  const context = asRecord(raw.context);
  const suggested = asRecord(raw.suggestedPriority);
  const officer = raw.officerPriority === null ? null : asRecord(raw.officerPriority);
  const reviewedObstruction = asRecord(raw.reviewedObstruction);
  const response = raw.response === null ? null : asRecord(raw.response);
  const reportId = asString(raw.id, `demo-local-${index + 1}`);
  const suggestedLevel = asPriority(suggested.level ?? raw.expectedPriority);
  const officerLevel = officer ? asPriority(officer.level) : null;
  const effectivePriority = asPriority(
    raw.effectivePriority ?? officerLevel ?? suggestedLevel,
  );

  return {
    id: reportId,
    reference: asString(raw.reference, `DEMO-${String(index + 1).padStart(3, "0")}`),
    createdAt: asString(raw.createdAt, new Date(0).toISOString()),
    updatedAt: asOptionalString(raw.updatedAt),
    version: Math.max(1, Math.floor(asNumber(raw.version, 1))),
    isDemo: raw.isDemo !== false,
    source: asString(raw.source, "seed"),
    label: asOptionalString(raw.label),
    location: {
      latitude: asNumber(location.latitude, 44.645),
      longitude: asNumber(location.longitude, -63.575),
      label: asString(location.label, "Halifax location pending confirmation"),
      method: asOptionalString(location.method),
      confirmedAt: asOptionalString(location.confirmedAt),
      provenance: asRecord(location.provenance) as StaffReport["location"]["provenance"],
    },
    photo: {
      url: asString(photo.url ?? raw.photoUrl, fallbackPhotoUrl(raw.photoKey)),
      alt: asString(photo.alt, "Representative tree incident photo"),
      provenance: asRecord(photo.provenance) as StaffReport["photo"]["provenance"],
    },
    citizenDetails: {
      title: asString(citizen.title, "Tree incident report"),
      category: asString(citizen.category, "other_unsure"),
      observations: asString(citizen.observations, "No citizen observation supplied."),
      targets: asStringArray(citizen.targets),
      damageAboveTarget: asAnswer(citizen.damageAboveTarget),
      obstruction: asObstruction(citizen.obstruction),
      cause: asString(citizen.cause, "unknown"),
      utilityConcern: asAnswer(citizen.utilityConcern),
      immediateDanger: asAnswer(citizen.immediateDanger),
      reviewedAt: asOptionalString(citizen.reviewedAt),
    },
    status: asStatus(raw.status),
    suggestedPriority: {
      level: suggestedLevel,
      ruleId: asString(suggested.ruleId, "insufficient-evidence"),
      supportingFields: asStringArray(suggested.supportingFields),
      explanation: asString(
        suggested.explanation,
        "Key evidence is missing or unverified. Human assessment is needed.",
      ),
    },
    officerPriority: officer
      ? {
          level: officerLevel ?? "unassessed",
          reason: asOptionalString(officer.reason),
          timestamp: asOptionalString(officer.timestamp),
        }
      : null,
    effectivePriority,
    reviewedObstruction: {
      level: asObstructionLevel(reviewedObstruction.level),
      target: asOptionalString(reviewedObstruction.target) ?? null,
      note: asString(reviewedObstruction.note, "No staff obstruction review yet."),
      reviewedAt: asOptionalString(reviewedObstruction.reviewedAt) ?? null,
    },
    response: response
      ? {
          type: asString(response.type, "inspection"),
          note: asString(response.note, "No response note recorded."),
          requestedAt: asString(response.requestedAt, raw.updatedAt as string),
        }
      : null,
    analysis: {
      state: asOptionalString(analysis.state),
      label: asOptionalString(analysis.label),
      originalDraft: analysis.originalDraft,
      staffSummary: asOptionalString(analysis.staffSummary),
      possibleImpact: asRecord(analysis.possibleImpact) as StaffReport["analysis"]["possibleImpact"],
      warnings: asStringArray(analysis.warnings),
    },
    context: {
      candidateTree: context.candidateTree,
      nearbyRoad: context.nearbyRoad,
      missingReasons: asStringArray(context.missingReasons),
    },
    staffSummary: asOptionalString(raw.staffSummary),
    possibleImpact: asOptionalString(raw.possibleImpact),
    uncertainties: asStringArray(raw.uncertainties),
    events: Array.isArray(raw.events)
      ? raw.events.map((event) => {
          const item = asRecord(event);
          return {
            id: asOptionalString(item.id),
            actionId: asOptionalString(item.actionId),
            type: asOptionalString(item.type),
            timestamp: asOptionalString(item.timestamp),
            createdAt: asOptionalString(item.createdAt),
            actor: asOptionalString(item.actor),
            actorLabel: asOptionalString(item.actorLabel),
            note: asOptionalString(item.note),
            resultingVersion:
              typeof item.resultingVersion === "number" ? item.resultingVersion : undefined,
          };
        })
      : [],
  };
}

export function normalizeStaffReports(value: unknown): StaffReport[] {
  if (!Array.isArray(value)) return [];
  return value.map((entry, index) => normalizeStaffReport(entry, index));
}

export function createFallbackStaffReports(): StaffReport[] {
  return normalizeStaffReports(createDemoIncidents());
}

export function priorityLabel(priority: StaffPriority): string {
  switch (priority) {
    case "urgent":
      return "Urgent review";
    case "priority":
      return "Priority review";
    case "routine":
      return "Routine review";
    default:
      return "Needs assessment";
  }
}

export function statusLabel(status: StaffStatus): string {
  switch (status) {
    case "inspection_requested":
      return "Inspection requested";
    case "response_assigned":
      return "Response simulated";
    case "reviewed":
      return "Reviewed";
    case "resolved":
      return "Resolved · demo";
    default:
      return "New report";
  }
}

export function categoryLabel(category: string): string {
  switch (category) {
    case "tree_damage":
      return "Tree damage";
    case "access_obstruction":
      return "Access obstruction";
    case "utility_conflict":
      return "Possible utility conflict";
    default:
      return "Other / unsure";
  }
}

export function responseLabel(type: string): string {
  switch (type) {
    case "clearance":
      return "Obstruction clearance";
    case "specialist_review":
      return "Specialist review";
    default:
      return "Inspection";
  }
}

export function formatStaffDate(value: string | undefined, withTime = true): string {
  if (!value) return "Unknown time";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown time";
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
    timeZone: "America/Halifax",
  }).format(date);
}

export function formatCoordinates(latitude: number, longitude: number): string {
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}

export function mapMarkerPosition(report: StaffReport): { left: string; top: string } {
  const x = ((report.location.longitude + 63.615) / 0.085) * 100;
  const y = (1 - (report.location.latitude - 44.57) / 0.14) * 100;
  return {
    left: `${Math.min(91, Math.max(9, x))}%`,
    top: `${Math.min(88, Math.max(12, y))}%`,
  };
}

export function publicPriorityColor(priority: StaffPriority): string {
  switch (priority) {
    case "urgent":
      return "#a83c2e";
    case "priority":
      return "#b7761b";
    case "routine":
      return "#587367";
    default:
      return "#557894";
  }
}
