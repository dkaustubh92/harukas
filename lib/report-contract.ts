import type { DemoIncident, DemoPriority, DemoStatus } from "./demo-incidents";

export type { DemoPriority, DemoStatus } from "./demo-incidents";

export type ReportEvent = {
  id: string;
  actionId: string;
  type: string;
  createdAt: string;
  label: string;
  note: string;
  version: number;
  isDemo: true;
};

export type Report = Omit<DemoIncident, "source" | "label" | "location" | "officerPriority" | "photo" | "analysis"> & {
  source: "seed" | "citizen";
  label: "Seeded demo" | "Demo report";
  photo: Omit<DemoIncident["photo"], "provenance"> & {
    provenance: Omit<DemoIncident["photo"]["provenance"], "kind"> & { kind: "representative" | "citizen_upload" };
  };
  analysis: Omit<DemoIncident["analysis"], "state" | "label" | "originalDraft"> & {
    state: "seeded" | "manual" | "unverified_draft";
    label: string;
    originalDraft: Record<string, unknown> | null;
  };
  location: Omit<DemoIncident["location"], "method" | "provenance"> & {
    method: "pin" | "address" | "gps";
    provenance?: DemoIncident["location"]["provenance"];
  };
  officerPriority: { level: DemoPriority; reason: string; reviewedAt: string } | null;
  effectivePriority: DemoPriority;
  events: ReportEvent[];
  municipalStatus: "not_sent";
};

export type PublicReport = Omit<Report, "analysis" | "context" | "officerPriority" | "events" | "reviewedObstruction" | "response"> & {
  officerPriority: { level: DemoPriority; reviewedAt: string } | null;
  events: Omit<ReportEvent, "note" | "actionId">[];
  reviewedObstruction: Omit<Report["reviewedObstruction"], "note">;
  response: Omit<NonNullable<Report["response"]>, "note"> | null;
};

export type ReportAction = {
  actionId: string;
  expectedVersion: number;
  type: "review" | "set_priority" | "request_inspection" | "assign_response" | "mark_obstruction" | "resolve";
  note?: string;
  priority?: DemoPriority;
  responseType?: "inspection" | "clearance" | "specialist_review";
  obstructionLevel?: "none" | "partial" | "full";
  target?: "road" | "sidewalk";
};

export const REPORT_PRIORITIES: DemoPriority[] = ["urgent", "priority", "unassessed", "routine"];
export const REPORT_STATUSES: DemoStatus[] = ["submitted", "reviewed", "inspection_requested", "response_assigned", "resolved"];

export const DEMO_STORE_META = {
  isDemo: true,
  storage: "server-memory",
  persistence: "Shared by requests to this running server. Resets on restart; separate server instances do not share changes.",
  municipalStatus: "not_sent",
  attributionUrl: "/demo-incidents/ATTRIBUTION.html",
} as const;
