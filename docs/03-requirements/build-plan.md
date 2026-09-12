# Webapp objectives and 150-minute build plan

**Historical proposal, superseded 12 Sep 2026, 12:03 ADT:** Use the
[finalized requirements](requirements-discussion.md) and
[current execution plan](execution-plan.md). The optional-photo, optional-map,
browser-local, and staff-first assumptions below no longer govern the build.

**Prepared: 12 Sep 2026, ~11:38 ADT. Status: recommended execution plan.**
The user requests a working webapp after 90 minutes, followed by 60 minutes of
incremental improvement. Times below are elapsed from the build start. If the
event deadline leaves less time, shorten the improvement phase first.

## Product objective

Turn a tree concern into an explained inspection priority that a forestry staff
member can review, then demonstrate how the report could enter Halifax's existing
intake process. The prototype never sends a real municipal request.

Three outcomes define the product:

1. A citizen can describe a concern and see what information their report contains.
2. A forestry staff member can see which requests to inspect first and why.
3. Both views can open the same report and a simulated municipal handoff containing
   its overview and report link.

The staff worklist is the core value. Citizen reporting is a small demonstration
of how new evidence enters that worklist. Triage remains a recommendation for
inspection, with uncertainty and human review visible.

## Two views and one report panel

| View | Main content | Main action |
|---|---|---|
| Citizen report | Three example reports, a short form, then a receipt. Collect category, location text, nearby people or structures, and recent cause or unknown. Use fictional contact values for demo presets | Create a HaruKas demo report |
| Staff triage | Seeded municipal queue, original priority, proposed inspection order, location, waiting time, and explanation summary | Open a report and review its proposed priority |
| Shared report panel | Citizen observations, candidate asset, diameter band, wires context, match distance, missing data, AI explanation, and source timestamps | Accept, adjust, or request field verification within the demo; preview the municipal handoff |

A labelled citizen/staff switch is sufficient for the demo. It is not access
control. Private contact fields must never appear in a public report view.

Use a consistent visual layout from the start: readable rows, clear priority
labels, restrained colour, and generous space around the selected report. The
main visual reveal is the queue changing order when evidence is considered.

## Required by minute 90

- A deployed URL opens to a populated staff queue. Preserve all requests in the
  selected snapshot, including those with missing coordinates or no asset match.
- The order changes using simple, declared triage rules. Keep the city's original
  priorities visible. Do not replace them or call the demo order HRM's dispatch order.
- Selecting a row shows evidence and uncertainty. Staff can review the recommendation
  locally without changing municipal data.
- A minimal citizen form and three presets create a distinct provisional demo item
  that appears in the staff view. Label synthetic entries and their counts separately.
- One live Claude analysis explains the available evidence for a selected report.
  The list remains usable while it loads or if it fails. Use an explicit cached
  example or the displayed rule inputs as fallback, never a fabricated AI response.
- A municipal preview contains an overview plus report URL within 500 characters.
  The action is **Simulate municipal submission** and the receipt says **Not sent to
  Halifax**, with a `DEMO-*` reference.
- Report state survives refresh in the demo browser and can be reset for rehearsal.
  Cross-device access to newly created reports is not promised in this first pass.
  Use a seeded report for a report link that must resolve on another device.
- The complete path works on the deployed app without live HRM queries, outgoing
  municipal submissions, crew dispatch, or notification messages.

Keep the existing stack. Start with seeded data and browser-local demo state.
Do not add authentication or a new database dependency to this first pass.
Run Claude on a selected report, not as a prerequisite for scoring every queue row.

## Build sequence

| Elapsed | Work | Visible completion check |
|---|---|---|
| 0–10 min | Fix the report shape, confirm the deployment path and Claude connection, establish layout and three presets | A baseline URL loads and the report contract is settled |
| 10–30 min | Seed request and inventory data, preserve no-match states, implement declared triage rules | The queue has inspectable data and a reproducible order |
| 30–50 min | Build the staff worklist, original/recommended order toggle, and report panel | A user can open a request, understand the recommendation, and review it |
| 50–70 min | Add the short citizen form, presets, provisional queue item, and live Claude explanation | A new demo report appears in the staff view with its supporting inputs |
| 70–90 min | Complete simulated handoff, receipt, browser-local persistence, reset, deployment, and end-to-end checks | Citizen input → staff review → simulated receipt works on the deployed URL |
| 90–110 min | Fix issues exposed by the full flow, then optionally add one photo upload with preview and vision analysis | Keep photo work only if its full path works within this block |
| 110–130 min | Improve hierarchy, transitions, useful loading/error states, and the actual demo device layout | The same flow becomes easier to understand and operate |
| 130–150 min | Freeze features, run production checks, rehearse, and prepare a cached or recorded fallback | The deployed demo is repeatable and recoverable |

Any optional photo upload goes only to HaruKas and the configured model provider
for analysis, never to Halifax. No native camera or location permission is required.
If vision cannot be completed in its timebox, keep the existing text-based flow.

KD and the coding agents own the implementation. HA prepares concise copy, the
three-minute story, and Q&A while reviewing the deployed URL. Luna max subagents
can take bounded data, UI, or verification tasks with separate file ownership.
The integrating agent owns the shared report contract and full demo path.

## Features to leave out

3D scenes, outage predictions, live weather, fleet routing, arrival estimates,
automatic property verification, native camera/GPS, PDF export, SMS/email, accounts,
and real municipal submissions do not belong on the critical path. A map or shared
database can be considered only after the required flow and rehearsal are complete.

## Cut rules

- If seeding the full queue slips, use a clearly labelled smaller real snapshot.
  Display its actual count. Do not imply that a handful of loaded rows is all 292.
- If the Claude connection fails, show rule inputs and a labelled cached example.
  Keep live reasoning as the first recovery task.
- If the citizen form slips, use the three presets to create provisional reports.
- If the minute-90 path is incomplete, use the next block to finish it. Drop photo
  work before borrowing from the final verification and rehearsal block.

The planning next step is complete once these views and outcomes are agreed. The
first implementation step is the shared report shape, seeded queue, and deployed
layout. The broader [vision](vision.md) remains the roadmap.
