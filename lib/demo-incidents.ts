import incidentInputs from "@/data/demo-incidents.json";
import photoInputs from "@/public/demo-incidents/photos.json";

// Authored fixtures for the prototype. Import these once when initializing an
// empty demo store; do not overwrite saved citizen reports or officer decisions.
// The app's runtime report contract can adapt this module when it is implemented.
// These are full staff fixtures: project them before returning public responses.
// Seed photo URLs are public static assets, not private uploaded storage objects.
export type DemoPriority = "urgent" | "priority" | "routine" | "unassessed";
export type DemoStatus =
  | "submitted"
  | "reviewed"
  | "inspection_requested"
  | "response_assigned"
  | "resolved";
export type DemoCategory =
  | "tree_damage"
  | "access_obstruction"
  | "utility_conflict"
  | "other_unsure";
export type DemoAnswer = "yes" | "no" | "unknown";
export type DemoTarget =
  | "road"
  | "sidewalk"
  | "bus_stop"
  | "playground"
  | "building"
  | "driveway"
  | "other"
  | "unknown";
export type DemoPhotoKey =
  | "fallen-tree"
  | "broken-branch"
  | "street-tree"
  | "tree-roots"
  | "tree-canopy";

export interface DemoIncidentPhoto {
  url: string;
  storagePath: string;
  mimeType: "image/jpeg";
  bytes: number;
  width: number;
  height: number;
  alt: string;
  provenance: {
    kind: "representative";
    title: string;
    author: string;
    sourceUrl: string;
    license: string;
    licenseUrl: string;
    changes: string;
    note: string;
  };
}

interface SeedIncidentInput {
  id: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
  location: {
    latitude: number;
    longitude: number;
    label: string;
    method: "pin";
    confirmedAt: string;
    provenance: {
      kind: "synthetic_road_placement";
      source: "HRM StreetNetwork";
      sourceUrl: string;
      sourceRetrievedAt: string;
      roadObjectId: number;
      roadName: string;
      note: string;
    };
  };
  citizenDetails: {
    title: string;
    category: DemoCategory;
    observations: string;
    targets: DemoTarget[];
    obstruction: "none" | "partial" | "full" | "unknown";
    cause: "storm" | "wind" | "ice" | "vehicle_impact" | "other" | "unknown";
    utilityConcern: DemoAnswer;
    immediateDanger: DemoAnswer;
    damageAboveTarget: DemoAnswer;
    reviewedAt: string;
  };
  status: DemoStatus;
  expectedPriority: DemoPriority;
  reviewedObstruction: {
    level: "none" | "partial" | "full";
    target: "road" | "sidewalk" | null;
    note: string;
    reviewedAt: string | null;
  };
  response: {
    type: "inspection" | "clearance" | "specialist_review";
    note: string;
    requestedAt: string;
  } | null;
  photoKey: DemoPhotoKey;
  staffSummary: string;
  possibleImpact: string;
  uncertainties: string[];
}

export interface DemoIncident
  extends Omit<
    SeedIncidentInput,
    "expectedPriority" | "photoKey" | "staffSummary" | "possibleImpact" | "uncertainties"
  > {
  clientSubmissionId: string;
  version: number;
  isDemo: true;
  source: "seed";
  label: "Seeded demo";
  photo: DemoIncidentPhoto;
  analysis: {
    state: "seeded";
    label: "Authored demo scenario";
    originalDraft: null;
    modelId: null;
    effort: null;
    promptVersion: null;
    generatedAt: null;
    staffSummary: string;
    possibleImpact: { illustrative: true; description: string };
    warnings: string[];
  };
  context: {
    candidateTree: null;
    nearbyRoad: null;
    missingReasons: string[];
  };
  suggestedPriority: {
    level: DemoPriority;
    ruleId: string;
    supportingFields: string[];
    explanation: string;
  };
  officerPriority: null;
}

export const DEMO_INCIDENT_DATASET = {
  label: "HaruKas demo snapshot",
  snapshotAt: "2026-09-12T15:44:05.411Z",
  reportsAsOf: "2026-09-12T15:00:00.000Z",
  description: "25 fictional citizen tree reports placed along Halifax-area roads.",
  generator: { model: "gpt-5.6-luna", reasoningEffort: "max" },
  photosNote: "Representative photos were taken elsewhere. They do not depict these fictional incidents.",
  attributionUrl: "/demo-incidents/ATTRIBUTION.html",
} as const;

const photos = photoInputs as Record<string, DemoIncidentPhoto>;

// Seed explanations describe authored citizen answers, never findings from the
// representative photos. The report API must apply its own rules to new reports.
function seedPriority(
  details: SeedIncidentInput["citizenDetails"],
  priority: DemoPriority,
): DemoIncident["suggestedPriority"] {
  if (priority === "urgent") {
    const immediateDanger = details.immediateDanger === "yes";
    return {
      level: "urgent",
      ruleId: immediateDanger ? "immediate-danger" : "full-access-obstruction",
      supportingFields: immediateDanger
        ? ["citizenDetails.immediateDanger"]
        : ["citizenDetails.obstruction", "citizenDetails.targets"],
      explanation: immediateDanger
        ? "The fictional citizen reports immediate danger; urgent human review is suggested."
        : "The fictional citizen reports a full road or sidewalk obstruction; urgent human review is suggested.",
    };
  }
  if (priority === "priority") {
    const partial = details.obstruction === "partial";
    const utility = details.utilityConcern === "yes";
    return {
      level: "priority",
      ruleId: partial ? "partial-access-obstruction" : utility ? "possible-utility-conflict" : "damaged-part-over-target",
      supportingFields: partial
        ? ["citizenDetails.obstruction", "citizenDetails.targets"]
        : utility
          ? ["citizenDetails.utilityConcern"]
          : ["citizenDetails.damageAboveTarget", "citizenDetails.targets"],
      explanation: partial
        ? "The fictional citizen reports partially blocked access; priority human review is suggested."
        : utility
          ? "The fictional citizen reports a possible utility conflict; priority human review is suggested."
          : "The fictional citizen reports a damaged or hanging part above a target; priority human review is suggested.",
    };
  }
  return {
    level: priority,
    ruleId: priority === "routine" ? "described-issue-no-urgent-trigger" : "insufficient-evidence",
    supportingFields: [
      "citizenDetails.observations",
      "citizenDetails.obstruction",
      "citizenDetails.utilityConcern",
      "citizenDetails.immediateDanger",
      "citizenDetails.damageAboveTarget",
    ],
    explanation: priority === "routine"
      ? "The fictional citizen describes an issue and reports no obstruction, utility concern, or immediate danger. Routine review is suggested."
      : "The fictional report leaves key evidence unknown. Human assessment is needed before assigning a priority.",
  };
}

export const DEMO_INCIDENTS: DemoIncident[] = (incidentInputs as SeedIncidentInput[]).map((input) => {
  const { expectedPriority, photoKey, staffSummary, possibleImpact, uncertainties, ...report } = input;
  // Per-report assets can arrive independently without breaking the seed batch.
  const photo = photos[input.reference] ?? photos[photoKey];
  if (
    !photo?.url ||
    !photo.provenance?.sourceUrl ||
    ![photo.bytes, photo.width, photo.height].every((value) => Number.isInteger(value) && value > 0)
  ) {
    throw new Error(`Missing or invalid demo photo metadata: ${photoKey}`);
  }
  return {
    ...report,
    clientSubmissionId: input.id,
    version: input.status === "submitted" ? 1 : input.status === "reviewed" ? 2 : input.status === "resolved" ? 4 : 3,
    isDemo: true,
    source: "seed",
    label: "Seeded demo",
    photo: structuredClone(photo),
    analysis: {
      state: "seeded",
      label: "Authored demo scenario",
      originalDraft: null,
      modelId: null,
      effort: null,
      promptVersion: null,
      generatedAt: null,
      staffSummary,
      possibleImpact: { illustrative: true, description: possibleImpact },
      warnings: [
        "This is an authored fictional scenario, not a live photo-analysis response.",
        "The representative photo was taken elsewhere and cannot verify this incident.",
        ...uncertainties,
      ],
    },
    context: {
      candidateTree: null,
      nearbyRoad: null,
      missingReasons: [
        "Coordinates place a fictional scenario on real road geometry; they are not verified incident locations.",
        "No municipal tree asset or ownership has been verified. Road and tree context layers are supplied separately.",
      ],
    },
    suggestedPriority: seedPriority(input.citizenDetails, expectedPriority),
    officerPriority: null,
  };
});

/** Return an independent copy so demo interactions never mutate the fixture. */
export function createDemoIncidents(): DemoIncident[] {
  return structuredClone(DEMO_INCIDENTS);
}
