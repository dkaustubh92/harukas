"use client";

import { useState } from "react";

export type AiDraft = {
  title: string;
  category: "tree_damage" | "access_obstruction" | "utility_conflict" | "other_unsure";
  observations: string;
  targets: Array<"road" | "sidewalk" | "bus_stop" | "playground" | "building" | "driveway" | "other" | "unknown">;
  damageAboveTarget: "yes" | "no" | "unknown";
  obstruction: "none" | "partial" | "full" | "unknown";
  utilityConcern: "yes" | "no" | "unknown";
  imageAssessment: "usable" | "unclear" | "unrelated";
  uncertainties: string[];
  staffSummary: string;
  possibleImpact: string;
};

type DraftResponse = { draft?: unknown };

function isDraft(value: unknown): value is AiDraft {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const draft = value as Record<string, unknown>;
  return typeof draft.title === "string"
    && typeof draft.category === "string"
    && typeof draft.observations === "string"
    && Array.isArray(draft.targets)
    && draft.targets.every((target) => typeof target === "string")
    && typeof draft.damageAboveTarget === "string"
    && typeof draft.obstruction === "string"
    && typeof draft.utilityConcern === "string"
    && typeof draft.imageAssessment === "string"
    && Array.isArray(draft.uncertainties)
    && draft.uncertainties.every((item) => typeof item === "string")
    && typeof draft.staffSummary === "string"
    && typeof draft.possibleImpact === "string";
}

function readMessage(body: unknown, fallback: string) {
  if (!body || typeof body !== "object" || Array.isArray(body)) return fallback;
  const error = (body as { error?: unknown }).error;
  if (error && typeof error === "object" && !Array.isArray(error) && typeof (error as { message?: unknown }).message === "string") {
    return (error as { message: string }).message;
  }
  return fallback;
}

export function AiDraftButton({
  photo,
  locationLabel,
  observations,
  onDraft,
}: {
  photo: File | null;
  locationLabel: string;
  observations: string;
  onDraft: (draft: AiDraft) => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const analyze = async () => {
    if (!photo || busy) return;
    setBusy(true);
    setError("");
    try {
      const form = new FormData();
      form.set("photo", photo);
      form.set("location", locationLabel);
      form.set("observations", observations);
      const response = await fetch("/api/analyze", { method: "POST", body: form });
      const body: unknown = await response.json().catch(() => null);
      const draft = body && typeof body === "object" ? (body as DraftResponse).draft : undefined;
      if (!response.ok) throw new Error(readMessage(body, "Photo analysis is unavailable. You can continue manually."));
      if (!isDraft(draft)) throw new Error("The analysis returned an incomplete draft. You can continue manually.");
      onDraft(draft);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Photo analysis is unavailable. You can continue manually.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-2xl border border-[#c8d9ca] bg-[#eef5ef] p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-semibold text-[#2f5947]">Draft a report from your photo</p>
          <p className="mt-1 text-xs leading-5 text-[#607568]">It describes visible evidence only. Review and edit every field before submitting.</p>
        </div>
        <button type="button" onClick={analyze} disabled={!photo || busy} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-[#315f4c] px-3.5 text-xs font-semibold text-white shadow-sm transition hover:bg-[#264e3e] disabled:cursor-not-allowed disabled:opacity-50">
          {busy ? "Analyzing…" : "Analyze photo"}
        </button>
      </div>
      {error ? <p className="mt-2 text-xs leading-5 text-[#8e3e34]" role="alert">{error}</p> : null}
    </div>
  );
}
