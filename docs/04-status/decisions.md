# Decision log

One line per decision, newest last. Reason included — a decision without its reason gets
re-litigated at 13:00 when everyone is tired.

Settled stack and standing decisions live in `../01-hackathon/runbook.md`; this file is
for decisions made *on the day*.

| Time | Decision | Reason |
|---|---|---|
| pre-event | Skills, not subagents, for persona work | Skills run in-session with full context; agents start cold and don't make code land faster |
| pre-event | Stack: Next.js + TS + Vercel AI SDK + Supabase → Vercel | Settled; not re-litigated |
| 12 Sep, pre-10:00 | Build window is 10:00–14:00, ideation **inside** it | Front of day cut 60 → 45 min; core path due 11:45 |
| 12 Sep, pre-10:00 | Phone sensors are available but not mandatory | Deployed URL reaches camera/mic/GPS with no extra stack; costs a 390px layout, so only if it's a WoW |
| 12 Sep, 10:00 | Demo budget is **3 min**, not 90 sec | Stated at the briefing |
| 12 Sep, 10:00 | Rubric: day-one impact ×2; product, idea, demo ×1 each | From the judging slide — overrides the `rubric` skill's assumed weights |
| 12 Sep, 10:xx | Docs consolidated under `docs/` | Four numbered folders; root keeps only CLAUDE.md, AGENTS.md, README.md |

| 12 Sep, ~10:15 | Research: trees PURSUE, reporting PASS | Data verified live. Trees has 292 open tickets with 87% at one priority and an 80K-tree asset inventory nobody joins. Reporting's obvious build needs an adoption curve, which fails the ×2 Monday criterion |

| 12 Sep, ~10:30 | **LOCKED: challenge #3, Which Tree Falls First** | Day-one impact is ×2 and trees answers it literally — 292 real tickets handed back sorted, no adoption needed. Reporting's obvious build needs residents to change behaviour first |
| 12 Sep, ~10:30 | Risk signal comes from the asset inventory, not complaint text | There is no complaint text in the public data. The join is proven: 29/30 within 60 m, median 18.9 m |
| 12 Sep, ~10:30 | Camera path is **out** unless core is hardened before 13:00 | Costs a 390px layout plus permission-prompt risk on the demo path |
| 12 Sep, ~10:30 | Framing is triage order, never a safety verdict | Indefensible otherwise, and a judge will push on it |

| 12 Sep, ~10:35 | Full product vision captured in `../03-requirements/vision.md` | Two user types (citizen + official), camera reporting, impact prediction, 3D map. **Captured, not scoped** — locked scope unchanged until reconciled |
| 12 Sep, 11:21 ADT | Add a municipal intake preview containing an overview and a HaruKas report link | User identified Halifax's existing Trees form as the intended route into the official request system. The inspected details field allows 500 characters. See [handoff requirements](../03-requirements/municipal-handoff.md) |
| 12 Sep, 11:21 ADT | **Prototype must never send real municipal requests** | Explicit user requirement. Simulate locally, label previews and receipts as not sent to Halifax, and ship no live submission path. This also applies to development and verification |

## Additional decisions, 12 Sep 2026, ~11:31 ADT

- Capture teammate intake categories, observed damage, nearby targets, cause, and
  staff review in [workflow notes](../03-requirements/citizen-report-workflow.md).
  Keep fleet management and dispatch estimates as future integrations because their
  operational data is unverified. All external actions remain simulated.
- Record the eight source leads and verified HRM census fields in
  [source research](../02-research/03-trees-data-sources.md). Use published diameter
  bands and unknown-code handling. Do not infer asset identity from proximity or
  property jurisdiction from census boundaries.

## Finalized requirements, 12:03 ADT

After two question rounds: citizen review is required,
officers need decision support for assigning a response, and visual 3D context is
preferred. The user delegated warning policy and impact-scenario selection. The
selected scenario is road/sidewalk obstruction; new markers stay unreviewed until
staff review. Photo/location reporting, both maps, and shared phone/laptop state
are core. See the [current execution plan](../03-requirements/execution-plan.md).
All dispatch and municipal actions remain simulated.

## Earlier proposal and remaining choices

- 12 Sep, ~11:38 ADT: User requests a 150-minute plan with a working app at minute
  90. [Recommended plan](../03-requirements/build-plan.md) and the
  [three-minute rehearsal aid](../03-requirements/demo-script.md) are written. The
  proposal is superseded by the canonical requirements and execution plan. Implementation
  has not started in this task.

Remaining product choice: final name, owned by HA. Use HaruKas until it changes.
The later answers resolve the earlier photo, location, map, and shared-storage
scope questions. Follow the current execution plan for those decisions.

## Current implementation override, 12 Sep 2026

- **App model target:** Once development replaces the generic route, route all app LLM processing through OpenRouter using the verified model ID `openai/gpt-5.6-luna` at high reasoning effort. The model accepts text and image input. The current scaffold route still uses Anthropic.
- **App inputs:** Browser photo selection and consented current-location access are P0. Native mobile app work and native camera capture remain out.
- **Build clock:** Deliver a working webapp by minute 75 of the implementation block. Use the remaining time before the hard **14:00** deadline for polish, hardening, and rehearsal. The hard cutoff overrides relative targets.
- **Secret:** Store `OPENROUTER_API_KEY` on the server only. `@next/env` detects it in the current local setup. Do not print or commit its value.
- **Setup dependency:** The Supabase project is `mgelmrwklixmhdhfxypk`, and the local Supabase URL matches it. The GitHub repository is `dkaustubh92/harukas`. `SUPABASE_SERVICE_ROLE_KEY` is absent, and no backend write has been tested.
- **Requirements gate:** Complete and review [product requirements](../03-requirements/product-requirements.md), [technical contract](../03-requirements/technical-contract.md), [acceptance checklist](../03-requirements/acceptance-checklist.md), and [execution plan](../03-requirements/execution-plan.md) before development. These are canonical. Older `scope.md` provides historical context. `demo-script.md` is a rehearsal aid subordinate to the canonical requirements.
- **Current repository state:** The repository is still a generic Next.js chat scaffold. The tree-report and queue flows are unbuilt at the time of this decision.
- **Prototype boundary:** Keep the municipal handoff and every external action simulated. The prototype never creates a real municipal request, uploads or sends a report to Halifax or Nova Scotia Power, dispatches a crew, or notifies a person. Receipts are simulated.
