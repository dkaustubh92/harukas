export type CitizenPriority = "urgent" | "priority" | "routine" | "unassessed";

export type CitizenStatus =
  | "submitted"
  | "reviewed"
  | "inspection_requested"
  | "response_assigned"
  | "resolved";

export type CitizenCategory =
  | "tree_damage"
  | "access_obstruction"
  | "utility_conflict"
  | "other_unsure";

export type CitizenAnswer = "yes" | "no" | "unknown";
export type CitizenObstruction = "none" | "partial" | "full" | "unknown";
export type CitizenCause =
  | "storm"
  | "wind"
  | "ice"
  | "vehicle_impact"
  | "other"
  | "unknown";

export type CitizenTarget =
  | "road"
  | "sidewalk"
  | "bus_stop"
  | "playground"
  | "building"
  | "driveway"
  | "other"
  | "unknown";

export interface CitizenLocation {
  latitude: number;
  longitude: number;
  label: string;
  method: "address" | "gps" | "pin" | string;
  confirmedAt?: string | null;
}

export interface CitizenPhoto {
  url?: string | null;
  accessUrl?: string | null;
  signedUrl?: string | null;
  alt?: string | null;
  storagePath?: string | null;
}

export interface CitizenDetails {
  title: string;
  category: CitizenCategory;
  observations: string;
  targets: CitizenTarget[];
  damageAboveTarget: CitizenAnswer;
  obstruction: CitizenObstruction;
  cause: CitizenCause;
  utilityConcern: CitizenAnswer;
  immediateDanger: CitizenAnswer;
  reviewedAt?: string | null;
}

export interface CitizenPrioritySuggestion {
  level: CitizenPriority;
  explanation?: string | null;
  supportingFields?: string[];
  ruleId?: string | null;
}

export interface CitizenReviewedObstruction {
  level: "none" | "partial" | "full";
  target?: "road" | "sidewalk" | null;
  note?: string | null;
  reviewedAt?: string | null;
}

export interface CitizenResponse {
  type?: "inspection" | "clearance" | "specialist_review" | string;
  note?: string | null;
  requestedAt?: string | null;
}

export interface CitizenReport {
  id: string;
  reference: string;
  clientSubmissionId?: string;
  createdAt: string;
  updatedAt: string;
  version?: number;
  isDemo: boolean;
  source: "seed" | "citizen" | string;
  label?: string | null;
  location: CitizenLocation;
  photo: CitizenPhoto;
  citizenDetails: CitizenDetails;
  status: CitizenStatus | string;
  suggestedPriority: CitizenPrioritySuggestion;
  officerPriority?: CitizenPrioritySuggestion | null;
  reviewedObstruction?: CitizenReviewedObstruction | null;
  response?: CitizenResponse | null;
  analysis?: {
    state?: string;
    label?: string | null;
    warnings?: string[];
  } | null;
  staffSummary?: string | null;
  possibleImpact?: string | null;
  uncertainties?: string[];
  url?: string;
}

export interface CitizenReceipt {
  mode: "server" | "local";
  report: CitizenReport;
  url: string;
  duplicate?: boolean;
  errorMessage?: string;
}

export const LOCAL_REPORTS_KEY = "harukas:local-reports";
export const REPRESENTATIVE_PHOTO_URL = "/demo-incidents/fallen-tree.jpg";
