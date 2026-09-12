"use client";

import { useState } from "react";
import type { StaffReport } from "./types";

type Draft = {
  title: string;
  category: string;
  observations: string;
  targets: string[];
  damageAboveTarget: string;
  obstruction: string;
  utilityConcern: string;
  imageAssessment: string;
  uncertainties: string[];
  staffSummary: string;
  possibleImpact: string;
};

function isDraft(value: unknown): value is Draft {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const draft = value as Record<string, unknown>;
  return typeof draft.title === "string"
    && typeof draft.category === "string"
    && typeof draft.observations === "string"
    && Array.isArray(draft.targets)
    && draft.targets.every((target) => typeof target === "string")
    && typeof draft.imageAssessment === "string"
    && Array.isArray(draft.uncertainties)
    && draft.uncertainties.every((item) => typeof item === "string")
    && typeof draft.staffSummary === "string"
    && typeof draft.possibleImpact === "string";
}

function errorMessage(body: unknown) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return "AI analysis is unavailable. Review the supplied evidence manually.";
  const error = (body as { error?: unknown }).error;
  if (error && typeof error === "object" && !Array.isArray(error) && typeof (error as { message?: unknown }).message === "string") return (error as { message: string }).message;
  return "AI analysis is unavailable. Review the supplied evidence manually.";
}

export function LlmReportDraft({ report }: { report: StaffReport }) {
  const [draft, setDraft] = useState<Draft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const runReview = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    try {
      const imageResponse = await fetch(report.photo.url, { cache: "no-store" });
      if (!imageResponse.ok) throw new Error("The report photo could not be loaded for analysis.");
      const blob = await imageResponse.blob();
      const mediaType = blob.type === "image/png" || blob.type === "image/webp" ? blob.type : "image/jpeg";
      const form = new FormData();
      form.set("photo", new File([blob], "report-photo.jpg", { type: mediaType }));
      form.set("location", report.location.label);
      form.set("observations", report.citizenDetails.observations);
      const response = await fetch("/api/analyze", { method: "POST", body: form });
      const body: unknown = await response.json().catch(() => null);
      if (!response.ok) throw new Error(errorMessage(body));
      const result = body && typeof body === "object" && !Array.isArray(body) ? (body as { draft?: unknown }).draft : null;
      if (!isDraft(result)) throw new Error("The analysis returned an incomplete draft.");
      setDraft(result);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "AI analysis is unavailable. Review the supplied evidence manually.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="rounded-xl border border-[#d7e5db] bg-[#f7fbf6] p-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.13em] text-[#557468]">AI review</p>
          <p className="mt-1 text-[11px] leading-4 text-[#64796c]">Run a fresh image reading. It stays advisory and does not change triage.</p>
        </div>
        <button type="button" onClick={runReview} disabled={busy} className="min-h-9 shrink-0 rounded-lg bg-[#315f4c] px-3 text-[10px] font-semibold text-white shadow-sm transition hover:bg-[#264e3e] disabled:cursor-wait disabled:opacity-50">
          {busy ? "Reading…" : draft ? "Run again" : "Run AI review"}
        </button>
      </div>
      {error ? <p className="mt-2 rounded-lg border border-[#e8c0bb] bg-[#fff3f1] px-2.5 py-2 text-[10px] leading-4 text-[#8e3e34]" role="alert">{error}</p> : null}
      {draft ? (
        <div className="mt-3 border-t border-[#dce8df] pt-3 text-[11px] leading-4 text-[#4e685a]">
          <div className="flex flex-wrap items-center gap-1.5"><span className="rounded bg-[#dce8d8] px-1.5 py-1 text-[9px] font-semibold text-[#35634c]">Live AI draft</span><span className="rounded bg-white px-1.5 py-1 text-[9px] text-[#6d8275]">{draft.imageAssessment}</span></div>
          <p className="mt-2 font-semibold text-[#294f40]">{draft.title}</p>
          <p className="mt-1">{draft.staffSummary}</p>
          <div className="mt-2 grid gap-1.5 sm:grid-cols-2"><p><span className="font-semibold text-[#557468]">Category:</span> {draft.category}</p><p><span className="font-semibold text-[#557468]">Obstruction:</span> {draft.obstruction}</p><p><span className="font-semibold text-[#557468]">Targets:</span> {draft.targets.join(", ") || "unknown"}</p><p><span className="font-semibold text-[#557468]">Utility:</span> {draft.utilityConcern}</p></div>
          <p className="mt-2 text-[#687d70]"><span className="font-semibold text-[#557468]">Possible impact:</span> {draft.possibleImpact}</p>
          {draft.uncertainties.length ? <p className="mt-2 text-[#7c6d50]"><span className="font-semibold">Needs human review:</span> {draft.uncertainties.join(" · ")}</p> : null}
        </div>
      ) : null}
    </section>
  );
}
