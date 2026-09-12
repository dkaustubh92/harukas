import "server-only";
import { randomUUID } from "node:crypto";
import sharp from "sharp";
import type { Report } from "./report-contract";
import { objectInput, ReportError, saveCitizenReport, textInput } from "./report-store";

function option<T extends string>(value: unknown, choices: readonly T[], fallback: T): T {
  if (value === undefined) return fallback;
  if (typeof value !== "string" || !choices.includes(value as T))
    throw new ReportError(400, "invalid_input", `Choose one of: ${choices.join(", ")}.`);
  return value as T;
}

function priority(details: Report["citizenDetails"]): Report["suggestedPriority"] {
  const access = details.targets.some((target) => target === "road" || target === "sidewalk");
  if (details.immediateDanger === "yes" || (details.obstruction === "full" && access))
    return { level: "urgent", ruleId: "reported-immediate-danger-or-full-obstruction", supportingFields: ["citizenDetails.immediateDanger", "citizenDetails.obstruction", "citizenDetails.targets"], explanation: "The citizen reports immediate danger or fully blocked road or sidewalk access. Urgent human review is suggested." };
  if ((details.obstruction === "partial" && access) || details.utilityConcern === "yes" || (details.damageAboveTarget === "yes" && details.targets.some((t) => t !== "unknown")))
    return { level: "priority", ruleId: "reported-access-utility-or-damaged-part", supportingFields: ["citizenDetails.obstruction", "citizenDetails.utilityConcern", "citizenDetails.damageAboveTarget", "citizenDetails.targets"], explanation: "The citizen reports partial access obstruction, a possible utility conflict, or a damaged part above a target. Priority human review is suggested." };
  if (details.observations && details.obstruction === "none" && details.utilityConcern === "no" && details.immediateDanger === "no" && details.damageAboveTarget === "no")
    return { level: "routine", ruleId: "described-issue-no-reported-trigger", supportingFields: ["citizenDetails.observations", "citizenDetails.obstruction", "citizenDetails.utilityConcern", "citizenDetails.immediateDanger", "citizenDetails.damageAboveTarget"], explanation: "The citizen describes an issue and reports no access obstruction, utility concern, immediate danger, or damaged part above a target. Routine review is suggested." };
  return { level: "unassessed", ruleId: "insufficient-evidence", supportingFields: ["citizenDetails"], explanation: "Some evidence is unknown or insufficient. Human assessment is needed before assigning a priority." };
}

async function boundedForm(request: Request): Promise<FormData> {
  const reader = request.body?.getReader();
  if (!reader) throw new ReportError(400, "invalid_input", "Add the photo and reviewed report details.");
  let length = 0;
  const chunks: Uint8Array[] = [];
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.byteLength;
    if (length > 3 * 1024 * 1024) {
      await reader.cancel();
      throw new ReportError(400, "image_too_large", "Choose an image no larger than 2 MB.");
    }
    chunks.push(value);
  }
  try {
    return await new Response(new Uint8Array(Buffer.concat(chunks)), { headers: { "Content-Type": request.headers.get("content-type") ?? "" } }).formData();
  } catch {
    throw new ReportError(400, "invalid_form", "Send a photo and the report payload as form data.");
  }
}

export async function createCitizenReport(request: Request) {
  const form = await boundedForm(request);
  const rawPayload = form.get("payload");
  if (typeof rawPayload !== "string" || rawPayload.length > 30000)
    throw new ReportError(400, "invalid_input", "Provide the reviewed report payload.");
  const input = objectInput(JSON.parse(rawPayload));
  const location = objectInput(input.location);
  if (input.reviewed !== true || location.confirmed !== true)
    throw new ReportError(400, "review_required", "Confirm the tree pin and review the report before submitting.");
  const lat = location.latitude, lon = location.longitude;
  if (typeof lat !== "number" || typeof lon !== "number" || !Number.isFinite(lat) || !Number.isFinite(lon) || lat < -90 || lat > 90 || lon < -180 || lon > 180)
    throw new ReportError(400, "invalid_location", "Choose a valid tree location on the map.");
  const d = objectInput(input.citizenDetails);
  const targetChoices = ["road", "sidewalk", "bus_stop", "playground", "building", "driveway", "other", "unknown"] as const;
  if (d.targets !== undefined && (!Array.isArray(d.targets) || d.targets.length > 8))
    throw new ReportError(400, "invalid_targets", "Choose up to eight nearby targets.");
  const now = new Date().toISOString();
  const details: Report["citizenDetails"] = {
    title: textInput(d.title, "Report title", 120),
    category: option(d.category, ["tree_damage", "access_obstruction", "utility_conflict", "other_unsure"], "other_unsure"),
    observations: d.observations === undefined || d.observations === "" ? "" : textInput(d.observations, "Observations", 2000),
    targets: [...new Set((d.targets as unknown[] | undefined ?? ["unknown"]).map((value) => option(value, targetChoices, "unknown")))],
    obstruction: option(d.obstruction, ["none", "partial", "full", "unknown"], "unknown"),
    cause: option(d.cause, ["storm", "wind", "ice", "vehicle_impact", "other", "unknown"], "unknown"),
    utilityConcern: option(d.utilityConcern, ["yes", "no", "unknown"], "unknown"),
    immediateDanger: option(d.immediateDanger, ["yes", "no", "unknown"], "unknown"),
    damageAboveTarget: option(d.damageAboveTarget, ["yes", "no", "unknown"], "unknown"),
    reviewedAt: now,
  };
  const photo = form.get("photo");
  if (!(photo instanceof File) || !["image/jpeg", "image/png", "image/webp"].includes(photo.type) || photo.size === 0 || photo.size > 2 * 1024 * 1024)
    throw new ReportError(400, "invalid_photo", "Add one JPEG, PNG, or WebP photo no larger than 2 MB.");
  let normalized;
  try {
    const decoder = sharp(Buffer.from(await photo.arrayBuffer()), { limitInputPixels: 25000000 });
    const metadata = await decoder.metadata();
    if (!["jpeg", "png", "webp"].includes(metadata.format ?? "")) throw new Error("Unsupported image");
    normalized = await decoder.rotate().resize(1600, 1600, { fit: "inside", withoutEnlargement: true }).jpeg({ quality: 82 }).toBuffer({ resolveWithObject: true });
  } catch {
    throw new ReportError(400, "invalid_photo", "This image could not be read. Choose a JPEG, PNG, or WebP photo.");
  }
  if (normalized.data.byteLength > 2 * 1024 * 1024)
    throw new ReportError(400, "invalid_photo", "Choose a smaller photo, no larger than 2 MB.");
  const draft = input.analysis === undefined ? null : objectInput(input.analysis);
  const id = randomUUID();
  const suggestion = priority(details);
  const report: Report = {
    id, reference: "", clientSubmissionId: textInput(input.clientSubmissionId, "Submission ID", 100),
    createdAt: now, updatedAt: now, version: 1, isDemo: true, source: "citizen", label: "Demo report",
    location: { latitude: lat, longitude: lon, label: textInput(location.label, "Location label", 250), method: option(location.method, ["pin", "gps", "address"], "pin"), confirmedAt: now },
    citizenDetails: details, status: "submitted", suggestedPriority: suggestion, effectivePriority: suggestion.level,
    officerPriority: null, reviewedObstruction: { level: "none", target: null, note: "", reviewedAt: null }, response: null,
    photo: { url: `/api/reports/${id}/photo`, storagePath: `memory/${id}`, mimeType: "image/jpeg", bytes: normalized.data.byteLength,
      width: normalized.info.width, height: normalized.info.height, alt: details.title,
      provenance: { kind: "citizen_upload", title: "Citizen demo upload", author: "", sourceUrl: "", license: "Not specified", licenseUrl: "", changes: "Normalized to JPEG, resized if needed, and embedded metadata removed.", note: "Photo submitted for this demo report. The location was confirmed by the citizen." } },
    analysis: { state: draft ? "unverified_draft" : "manual", label: draft ? "Submitted draft · Review required" : "Manual demo report",
      originalDraft: draft, modelId: null, effort: null, promptVersion: null, generatedAt: null,
      staffSummary: `${details.title}. ${suggestion.explanation}`,
      possibleImpact: { illustrative: true, description: "If the reported issue affects road or sidewalk access, an inspection can establish the extent. No fall footprint has been measured." },
      warnings: ["The citizen reviewed these observations. This backend does not certify tree condition or verify client-provided AI output."] },
    context: { candidateTree: null, nearbyRoad: null, missingReasons: ["No inventory match has been confirmed for this submission."] },
    events: [{ id: randomUUID(), actionId: "submitted", type: "submitted", createdAt: now, label: "Report submitted · Demo", note: "Citizen reviewed and submitted the demo report.", version: 1, isDemo: true }],
    municipalStatus: "not_sent",
  };
  return saveCitizenReport(report, new Uint8Array(normalized.data));
}
