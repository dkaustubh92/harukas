"use client";

import {
  categoryLabel,
  formatCoordinates,
  formatStaffDate,
  statusLabel,
  type ActionType,
  type ObstructionLevel,
  type StaffPriority,
  type StaffReport,
} from "./types";
import { LlmReportDraft } from "./LlmReportDraft";
import { PriorityReason } from "./PriorityReason";

export type ResponseType = "inspection" | "clearance" | "specialist_review";

interface StaffEvidenceProps {
  report: StaffReport | null;
  actionBusy: ActionType | null;
  actionMessage: { kind: "success" | "warning"; text: string } | null;
  actionError: string | null;
  priorityDraft: StaffPriority;
  priorityNote: string;
  inspectionNote: string;
  responseType: ResponseType;
  responseNote: string;
  obstructionLevel: ObstructionLevel;
  obstructionTarget: string;
  obstructionNote: string;
  resolutionNote: string;
  onPriorityDraftChange: (value: StaffPriority) => void;
  onPriorityNoteChange: (value: string) => void;
  onInspectionNoteChange: (value: string) => void;
  onResponseTypeChange: (value: ResponseType) => void;
  onResponseNoteChange: (value: string) => void;
  onObstructionLevelChange: (value: ObstructionLevel) => void;
  onObstructionTargetChange: (value: string) => void;
  onObstructionNoteChange: (value: string) => void;
  onResolutionNoteChange: (value: string) => void;
  onAction: (type: ActionType) => void;
  onRetry: () => void;
}

const fieldClass =
  "h-9 w-full rounded-lg border border-[#d8e3da] bg-white px-2.5 text-[11px] text-[#294f40] outline-none transition placeholder:text-[#98a79e] focus:border-[#7da18d] focus:ring-2 focus:ring-[#cfe2d5]";
const textareaClass =
  "min-h-[58px] w-full resize-y rounded-lg border border-[#d8e3da] bg-white px-2.5 py-2 text-[11px] leading-4 text-[#294f40] outline-none transition placeholder:text-[#98a79e] focus:border-[#7da18d] focus:ring-2 focus:ring-[#cfe2d5]";

function answerLabel(value: string): string {
  if (value === "yes") return "Yes";
  if (value === "no") return "No";
  if (value === "full") return "Fully blocked";
  if (value === "partial") return "Partly blocked";
  if (value === "none") return "No blockage reported";
  return "Unknown";
}

function actionLabel(type: string): string {
  switch (type) {
    case "review":
      return "Reviewed";
    case "set_priority":
      return "Priority adjusted";
    case "request_inspection":
      return "Inspection requested";
    case "assign_response":
      return "Response simulated";
    case "mark_obstruction":
      return "Obstruction reviewed";
    case "resolve":
      return "Demo resolved";
    default:
      return "Action recorded";
  }
}

export function StaffEvidence({
  report,
  actionBusy,
  actionMessage,
  actionError,
  priorityDraft,
  priorityNote,
  inspectionNote,
  responseType,
  responseNote,
  obstructionLevel,
  obstructionTarget,
  obstructionNote,
  resolutionNote,
  onPriorityDraftChange,
  onPriorityNoteChange,
  onInspectionNoteChange,
  onResponseTypeChange,
  onResponseNoteChange,
  onObstructionLevelChange,
  onObstructionTargetChange,
  onObstructionNoteChange,
  onResolutionNoteChange,
  onAction,
  onRetry,
}: StaffEvidenceProps) {
  if (!report) {
    return (
      <aside className="flex min-h-[540px] flex-col bg-[#fbfcfa] lg:min-h-0">
        <div className="flex flex-1 items-center justify-center px-8 text-center">
          <div>
            <p className="text-sm font-semibold text-[#3f5e50]">Select a report</p>
            <p className="mt-1 text-xs leading-5 text-[#87978d]">
              Choose a queue item or map marker to review its evidence and next action.
            </p>
          </div>
        </div>
      </aside>
    );
  }

  const unknownFields = [
    report.citizenDetails.damageAboveTarget === "unknown" ? "Damaged part above a target" : null,
    report.citizenDetails.obstruction === "unknown" ? "Access obstruction" : null,
    report.citizenDetails.utilityConcern === "unknown" ? "Utility concern" : null,
    report.citizenDetails.immediateDanger === "unknown" ? "Immediate danger" : null,
  ].filter((field): field is string => Boolean(field));
  const missingEvidence = Array.from(
    new Set([
      ...unknownFields.map((field) => field + " is unknown"),
      ...report.context.missingReasons,
      ...(report.analysis.warnings ?? []).filter((warning) => warning.toLowerCase().includes("unknown")),
    ]),
  );
  const summary = report.analysis.staffSummary || report.staffSummary || "No staff summary supplied.";
  const isResolved = report.status === "resolved";
  const canMarkReviewed = report.status === "submitted";
  const isSeeded = report.isDemo && report.source === "seed";
  const population = report.context.population;

  return (
    <aside className="flex min-h-[540px] min-w-0 flex-col bg-[#fbfcfa] lg:min-h-0">
      <div className="border-b border-[#e2e8e2] px-5 pb-4 pt-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="font-mono text-[10px] font-semibold tracking-[0.08em] text-[#557468]">
                {report.reference}
              </span>
              {isSeeded ? (
                <span className="rounded bg-[#f3f0e7] px-1.5 py-0.5 text-[9px] font-semibold text-[#817451]">
                  Seeded demo
                </span>
              ) : (
                <span className="rounded bg-[#eaf3f7] px-1.5 py-0.5 text-[9px] font-semibold text-[#4d6e7d]">
                  Citizen report
                </span>
              )}
            </div>
            <h2 className="mt-1.5 text-[19px] font-semibold leading-6 tracking-[-0.03em] text-[#183e32]">
              {report.citizenDetails.title}
            </h2>
            <p className="mt-1 text-[11px] text-[#788a80]">
              Submitted {formatStaffDate(report.createdAt)} · v{report.version}
            </p>
          </div>
          <span className="shrink-0 rounded-full border border-[#d4e0d6] bg-[#f2f8f2] px-2 py-1 text-[10px] font-semibold text-[#4c715b]">
            {statusLabel(report.status)}
          </span>
        </div>
        <div className="mt-3 flex items-start gap-2 rounded-lg border border-[#e2e9e3] bg-white px-3 py-2.5">
          <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-[#5e7f6c]" aria-hidden="true" />
          <div className="min-w-0">
            <p className="text-[11px] font-semibold text-[#426253]">{report.location.label}</p>
            <p className="mt-0.5 text-[10px] text-[#84958b]">
              {formatCoordinates(report.location.latitude, report.location.longitude)} ·{" "}
              {report.location.method ?? "pin"} confirmed
            </p>
          </div>
        </div>
        <PriorityReason report={report} />
        {!isResolved ? (
          <button
            type="button"
            onClick={() => onAction(canMarkReviewed ? "review" : "assign_response")}
            disabled={Boolean(actionBusy)}
            className="mt-3 min-h-11 w-full rounded-lg bg-[#183e32] px-4 text-[11px] font-semibold text-white shadow-sm transition hover:bg-[#275444] disabled:cursor-wait disabled:opacity-50"
          >
            {actionBusy
              ? "Saving demo decision…"
              : canMarkReviewed
                ? "Mark reviewed"
                : "Simulate response assignment"}
          </button>
        ) : null}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
        {actionMessage ? (
          <div
            role="status"
            className={
              "mb-3 rounded-lg border px-3 py-2 text-[11px] leading-4 " +
              (actionMessage.kind === "success"
                ? "border-[#bed8c4] bg-[#eff8f0] text-[#3f6b4f]"
                : "border-[#e9cfad] bg-[#fff8ec] text-[#805e28]")
            }
          >
            {actionMessage.text}
          </div>
        ) : null}
        {actionError ? (
          <div className="mb-3 rounded-lg border border-[#e8c0bb] bg-[#fff3f1] px-3 py-2.5 text-[11px] leading-4 text-[#8e3e34]">
            <p className="font-semibold">Action not saved</p>
            <p className="mt-0.5">{actionError}</p>
            <button
              type="button"
              onClick={onRetry}
              className="mt-2 rounded-md border border-[#dca69f] bg-white px-2 py-1 text-[10px] font-semibold text-[#8e3e34] hover:bg-[#fffaf9]"
            >
              Retry latest action
            </button>
          </div>
        ) : null}

        <div className="grid gap-3">
          <section className="overflow-hidden rounded-xl border border-[#e0e8e1] bg-white">
            <div className="relative aspect-[16/8.5] overflow-hidden bg-[#dce9e6]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={report.photo.url} alt={report.photo.alt} className="h-full w-full object-cover" />
              <div className="absolute inset-x-2 bottom-2 flex items-end justify-between gap-2">
                <span className="rounded-md bg-[#183e32]/85 px-2 py-1 text-[9px] font-medium text-white">
                  Evidence photo
                </span>
                <span className="rounded-md bg-white/90 px-2 py-1 text-right text-[9px] font-medium leading-3 text-[#6c7d73] shadow-sm">
                  Representative image
                  <br />
                  not location evidence
                </span>
              </div>
            </div>
            <div className="px-3.5 py-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#72867a]">
                  Citizen-reviewed details
                </p>
                <span className="rounded bg-[#f4f6f2] px-1.5 py-0.5 text-[9px] text-[#7a8c82]">
                  {categoryLabel(report.citizenDetails.category)}
                </span>
              </div>
              <p className="mt-2 text-[12px] leading-5 text-[#50685c]">{report.citizenDetails.observations}</p>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                <EvidenceChip label="Target" value={report.citizenDetails.targets.join(", ") || "Unknown"} />
                <EvidenceChip label="Obstruction" value={answerLabel(report.citizenDetails.obstruction)} />
                <EvidenceChip label="Utility" value={answerLabel(report.citizenDetails.utilityConcern)} />
                <EvidenceChip label="Danger" value={answerLabel(report.citizenDetails.immediateDanger)} />
              </div>
            </div>
          </section>

          <LlmReportDraft key={report.id} report={report} />

          {missingEvidence.length ? (
            <section className="rounded-xl border border-[#e5d9c5] bg-[#fffbf4] p-3.5">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#8c7755]">Missing evidence</p>
              <ul className="mt-2 grid gap-1.5 text-[11px] leading-4 text-[#75694f]">
                {missingEvidence.slice(0, 6).map((item) => (
                  <li key={item} className="flex gap-2">
                    <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#b99b64]" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="rounded-xl border border-[#e0e8e1] bg-white p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#72867a]">Original analysis</p>
                <p className="mt-1 text-[11px] leading-4 text-[#566f62]">{summary}</p>
              </div>
              <span className="shrink-0 rounded bg-[#f4f0e7] px-1.5 py-1 text-[9px] font-semibold text-[#817451]">
                {report.analysis.label || (isSeeded ? "Cached demo analysis" : "Luna draft")}
              </span>
            </div>
            <p className="mt-2.5 text-[10px] leading-4 text-[#8a9a90]">
              Analysis is read-only evidence. Current triage follows the citizen-reviewed fields above.
            </p>
          </section>

          <section className="rounded-xl border border-[#e0e8e1] bg-white p-3.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#72867a]">Source context</p>
              <span className="text-[9px] text-[#98a79f]">candidate, not confirmed</span>
            </div>
            <div className="mt-2 grid gap-1.5 text-[11px] text-[#60776a]">
              <ContextRow label="Nearby road" value={report.location.provenance?.roadName || "Not available"} />
              <ContextRow label="Tree asset" value={report.context.candidateTree ? "Candidate match supplied" : "No candidate match"} />
              <ContextRow
                label="Source timestamp"
                value={formatStaffDate(report.location.provenance?.sourceRetrievedAt, false)}
              />
            </div>
          </section>

          {population ? (
            <section className="rounded-xl border border-[#d9e5dc] bg-[#f7fbf7] p-3.5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#5c7968]">Resident area context</p>
                <span className="rounded bg-[#e7f1e9] px-1.5 py-1 text-[9px] font-semibold text-[#52705e]">
                  {population.censusYear ?? 2021} Census
                </span>
              </div>
              <div className="mt-2 grid gap-1.5 text-[11px] text-[#526c5b]">
                <ContextRow
                  label="Population density"
                  value={population.densityPerSquareKm === undefined ? "Not available" : `${Math.round(population.densityPerSquareKm).toLocaleString()} residents/km²`}
                />
                <ContextRow
                  label="Area population"
                  value={population.population2021 === undefined ? "Not available" : `${Math.round(population.population2021).toLocaleString()} residents`}
                />
                <ContextRow label="Dissemination area" value={population.daUid || "Not available"} />
              </div>
              <p className="mt-2.5 text-[10px] leading-4 text-[#718376]">
                {population.warning || "Resident density is area context, not live occupancy or an affected-population estimate."}
              </p>
            </section>
          ) : null}

          <section className="rounded-xl border border-[#e0e8e1] bg-white p-3.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#72867a]">Officer actions</p>
              {isResolved ? (
                <span className="rounded bg-[#eff2ef] px-1.5 py-1 text-[9px] font-semibold text-[#788880]">Read-only</span>
              ) : (
                <span className="text-[9px] text-[#98a79f]">saved with version {report.version}</span>
              )}
            </div>

            {isResolved ? (
              <div className="mt-3 rounded-lg border border-[#d9e3db] bg-[#f6f8f6] px-3 py-2.5 text-[11px] leading-4 text-[#63766b]">
                This demo report is resolved. Its previous evidence and event history remain available for review.
              </div>
            ) : (
              <>
                <div className="mt-3 grid gap-2">
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <label>
                      <span className="mb-1 block text-[10px] font-medium text-[#667b6e]">Set priority</span>
                      <select
                        value={priorityDraft}
                        onChange={(event) => onPriorityDraftChange(event.target.value as StaffPriority)}
                        className={fieldClass}
                      >
                        <option value="urgent">Urgent review</option>
                        <option value="priority">Priority review</option>
                        <option value="unassessed">Needs assessment</option>
                        <option value="routine">Routine review</option>
                      </select>
                    </label>
                    <div className="flex items-end">
                      <button
                        type="button"
                        onClick={() => onAction("set_priority")}
                        disabled={Boolean(actionBusy)}
                        className="h-9 rounded-lg bg-[#315f4c] px-3 text-[10px] font-semibold text-white shadow-sm transition hover:bg-[#264e3e] disabled:cursor-wait disabled:opacity-50"
                      >
                        {actionBusy === "set_priority" ? "Saving…" : "Adjust priority"}
                      </button>
                    </div>
                  </div>
                  <input
                    value={priorityNote}
                    onChange={(event) => onPriorityNoteChange(event.target.value)}
                    placeholder="Reason for human override (required)"
                    className={fieldClass}
                    aria-label="Reason for priority adjustment"
                  />
                </div>

                <div className="mt-3 grid gap-2 border-t border-[#edf1ed] pt-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-medium text-[#667b6e]">Review evidence</p>
                    <p className="mt-1 text-[10px] leading-4 text-[#87988e]">
                      Confirm the report before making an access decision.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onAction("review")}
                    disabled={Boolean(actionBusy) || !canMarkReviewed}
                    className="h-9 rounded-lg border border-[#b8d1bd] bg-[#f0f8f1] px-3 text-[10px] font-semibold text-[#396348] transition hover:bg-[#e5f2e7] disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionBusy === "review" ? "Saving…" : canMarkReviewed ? "Mark reviewed" : "Review recorded"}
                  </button>
                </div>

                <div className="mt-3 border-t border-[#edf1ed] pt-3">
                  <p className="text-[10px] font-medium text-[#667b6e]">Access review</p>
                  <div className="mt-2 grid grid-cols-2 gap-2">
                    <label>
                      <span className="sr-only">Reviewed obstruction level</span>
                      <select
                        value={obstructionLevel}
                        onChange={(event) => onObstructionLevelChange(event.target.value as ObstructionLevel)}
                        className={fieldClass}
                      >
                        <option value="none">No obstruction confirmed</option>
                        <option value="partial">Partial access obstruction</option>
                        <option value="full">Full access obstruction</option>
                      </select>
                    </label>
                    <label>
                      <span className="sr-only">Affected access target</span>
                      <select
                        value={obstructionTarget}
                        onChange={(event) => onObstructionTargetChange(event.target.value)}
                        className={fieldClass}
                      >
                        <option value="road">Road</option>
                        <option value="sidewalk">Sidewalk</option>
                        <option value="unknown">Unknown target</option>
                      </select>
                    </label>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <input
                      value={obstructionNote}
                      onChange={(event) => onObstructionNoteChange(event.target.value)}
                      placeholder="What did the review confirm?"
                      className={fieldClass}
                      aria-label="Obstruction review note"
                    />
                    <button
                      type="button"
                      onClick={() => onAction("mark_obstruction")}
                      disabled={Boolean(actionBusy)}
                      className="h-9 shrink-0 rounded-lg border border-[#d1dfd4] bg-white px-3 text-[10px] font-semibold text-[#466858] transition hover:bg-[#f1f7f2] disabled:cursor-wait disabled:opacity-50"
                    >
                      {actionBusy === "mark_obstruction" ? "Saving…" : "Mark obstruction"}
                    </button>
                  </div>
                </div>

                <div className="mt-3 border-t border-[#edf1ed] pt-3">
                  <p className="text-[10px] font-medium text-[#667b6e]">Response simulation</p>
                  <div className="mt-2 grid gap-2">
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <label>
                        <span className="sr-only">Response type</span>
                        <select
                          value={responseType}
                          onChange={(event) => onResponseTypeChange(event.target.value as ResponseType)}
                          className={fieldClass}
                        >
                          <option value="inspection">Inspection</option>
                          <option value="clearance">Obstruction clearance</option>
                          <option value="specialist_review">Specialist review</option>
                        </select>
                      </label>
                      <button
                        type="button"
                        onClick={() => onAction("assign_response")}
                        disabled={Boolean(actionBusy)}
                        className="h-9 rounded-lg bg-[#315f4c] px-3 text-[10px] font-semibold text-white shadow-sm transition hover:bg-[#264e3e] disabled:cursor-wait disabled:opacity-50"
                      >
                        {actionBusy === "assign_response" ? "Saving…" : "Simulate response assignment"}
                      </button>
                    </div>
                    <textarea
                      value={responseNote}
                      onChange={(event) => onResponseNoteChange(event.target.value)}
                      placeholder="Demo response note (required)"
                      className={textareaClass}
                      aria-label="Response simulation note"
                    />
                    <div className="grid grid-cols-[1fr_auto] gap-2">
                      <textarea
                        value={inspectionNote}
                        onChange={(event) => onInspectionNoteChange(event.target.value)}
                        placeholder="Inspection request note (required)"
                        className={textareaClass}
                        aria-label="Inspection request note"
                      />
                      <button
                        type="button"
                        onClick={() => onAction("request_inspection")}
                        disabled={Boolean(actionBusy)}
                        className="h-fit min-h-[58px] rounded-lg border border-[#d1dfd4] bg-white px-3 text-[10px] font-semibold text-[#466858] transition hover:bg-[#f1f7f2] disabled:cursor-wait disabled:opacity-50"
                      >
                        {actionBusy === "request_inspection" ? "Saving…" : "Request inspection"}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-3 rounded-lg border border-[#eed6c8] bg-[#fff8f3] p-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#976347]">Close the demo loop</p>
                      <p className="mt-1 text-[10px] leading-4 text-[#8d7567]">
                        Resolution is synthetic. It does not dispatch a crew or change a municipal record.
                      </p>
                    </div>
                    <span className="rounded bg-[#fff0e7] px-1.5 py-1 text-[9px] font-semibold text-[#9a6043]">Demo only</span>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <textarea
                      value={resolutionNote}
                      onChange={(event) => onResolutionNoteChange(event.target.value)}
                      placeholder="Resolution note (required)"
                      className={textareaClass}
                      aria-label="Resolution note"
                    />
                    <button
                      type="button"
                      onClick={() => onAction("resolve")}
                      disabled={Boolean(actionBusy)}
                      className="h-fit min-h-[58px] shrink-0 rounded-lg border border-[#d19a80] bg-white px-3 text-[10px] font-semibold text-[#8d573e] transition hover:bg-[#fff1e9] disabled:cursor-wait disabled:opacity-50"
                    >
                      {actionBusy === "resolve" ? "Saving…" : "Resolve demo report"}
                    </button>
                  </div>
                </div>
              </>
            )}
          </section>

          <section className="rounded-xl border border-[#e0e8e1] bg-white p-3.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#72867a]">Event history</p>
              <span className="text-[9px] text-[#98a79f]">{report.events.length} event{report.events.length === 1 ? "" : "s"}</span>
            </div>
            {report.events.length ? (
              <div className="mt-3 space-y-2.5">
                {report.events.slice(-5).reverse().map((event, index) => (
                  <div key={event.id || event.actionId || (event.timestamp || "event") + "-" + index} className="relative pl-4">
                    <span aria-hidden="true" className="absolute left-0 top-1.5 h-1.5 w-1.5 rounded-full bg-[#709582]" />
                    <p className="text-[11px] font-medium text-[#4e685a]">{actionLabel(event.type || "action")}</p>
                    <p className="mt-0.5 text-[10px] leading-4 text-[#87988e]">
                      {event.note || "No note supplied."} · {formatStaffDate(event.timestamp || event.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="mt-2 text-[11px] leading-4 text-[#87988e]">
                No officer events yet. Actions are recorded only after the server confirms persistence.
              </p>
            )}
          </section>
        </div>
      </div>
    </aside>
  );
}

function EvidenceChip({ label, value }: { label: string; value: string }) {
  return (
    <span className="rounded-md border border-[#e1e9e2] bg-[#f7faf7] px-2 py-1 text-[10px] text-[#62786b]">
      <span className="font-medium text-[#84958b]">{label} · </span>
      {value}
    </span>
  );
}

function ContextRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-[#f0f3ef] pb-1.5 last:border-0 last:pb-0">
      <span className="text-[#87988e]">{label}</span>
      <span className="truncate text-right font-medium text-[#577061]">{value}</span>
    </div>
  );
}
