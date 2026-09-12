import { priorityLabel, type StaffReport } from "./types";

const tones = {
  urgent: "border-[#b54032] bg-[#fff3ef] text-[#842d24]",
  priority: "border-[#b57920] bg-[#fff8e8] text-[#765015]",
  routine: "border-[#346553] bg-[#eff7f1] text-[#28513f]",
  unassessed: "border-[#4b6e8a] bg-[#f0f6fb] text-[#34556e]",
};

function answer(value: string) {
  return value === "yes" ? "Reported" : value === "no" ? "Not reported" : "Unknown";
}

export function PriorityReason({ report }: { report: StaffReport }) {
  const details = report.citizenDetails;
  const fields = report.suggestedPriority.supportingFields;
  const facts = [
    { field: "immediateDanger", label: "Immediate danger", value: answer(details.immediateDanger) },
    { field: "obstruction", label: "Access", value: ({ full: "Fully blocked", partial: "Partly blocked", none: "No blockage reported", unknown: "Unknown" })[details.obstruction] },
    { field: "utilityConcern", label: "Utility concern", value: answer(details.utilityConcern) },
    { field: "damageAboveTarget", label: "Damage above a target", value: answer(details.damageAboveTarget) },
    { field: "targets", label: "Nearby", value: details.targets.map(value => value.replaceAll("_", " ")).join(", ") || "Unknown" },
  ].filter(fact => fields.includes("citizenDetails") || fields.includes(`citizenDetails.${fact.field}`) || fields.includes(fact.field));
  const humanDecision = report.officerPriority;

  return <section aria-label="Why this priority?" className={`mt-3 rounded-lg border border-l-4 p-3 ${tones[report.effectivePriority]}`}>
    <div className="flex flex-wrap items-center justify-between gap-2">
      <h3 className="text-base font-semibold">Why this priority?</h3>
      <span className="rounded border border-current/20 bg-white/70 px-2 py-1 text-xs font-semibold">{priorityLabel(report.effectivePriority)}</span>
    </div>
    <p className="mt-1 text-xs font-medium">{humanDecision ? "Human decision" : "Suggested from citizen-reported evidence"}</p>
    <p className="mt-2 text-sm font-medium leading-5">{humanDecision ? humanDecision.reason || "A reviewer changed the priority. No reason was recorded." : report.suggestedPriority.explanation}</p>
    {facts.length > 0 && <div className="mt-3 border-t border-current/15 pt-2">
      <p className="text-xs font-medium">Citizen-reported facts</p>
      <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
      {facts.map(fact => <div key={fact.field}><dt className="opacity-80">{fact.label}</dt><dd className="mt-0.5 font-semibold">{fact.value}</dd></div>)}
      </dl>
    </div>}
    {humanDecision && <details className="mt-2 text-xs">
      <summary className="cursor-pointer py-1 font-medium">Original suggestion: {priorityLabel(report.suggestedPriority.level)}</summary>
      <p className="mt-1 leading-5">{report.suggestedPriority.explanation}</p>
    </details>}
  </section>;
}
