# Scope — locked at the kill gate

**Historical scope, superseded 12 Sep 2026, 12:03 ADT:** Use the
[finalized requirements](requirements-discussion.md) and [current execution plan](execution-plan.md).
They require photo reporting, location, maps, and shared state. The selected tree
challenge and no-real-submission requirement remain fixed. The older exclusions
below are retained as decision history and must not govern implementation.

**Challenge: #3 Which Tree Falls First.** Decided 12 Sep 2026, ~10:30. Not revisited.

**Planning update, ~11:38 ADT:** The user's new timing target is a working app in
90 minutes plus 60 minutes of improvement. The [recommended build plan](build-plan.md)
proposes a minimal citizen intake around the staff queue. It is an explicit scope
proposal; the broader camera, map, and fleet vision is not automatically included.

**Scope addition, 12 Sep 2026, 11:21 ADT:** The user added a simulated municipal
request handoff with an overview and report link. Real submissions are prohibited.
Details are in [Municipal request handoff](municipal-handoff.md).

## The one sentence

> HRM has 292 open tree requests and 253 of them are filed at the same lowest priority.
> We hand the queue back ordered by risk, using the city's own tree inventory — no site
> visit, no new data, no complaint text required.

## The Monday person

**HRM urban forestry dispatch.** Monday at 8am they have 292 tickets that look identical,
one of them 432 days old, and no basis to choose. We give them the same list, ordered, with
the reason for each position. Nothing to adopt, nothing to integrate — it is their queue.

## The three WoWs

| | |
|---|---|
| **Technical** | The risk signal comes from a **spatial join nobody makes**: request coordinate → nearest tree in the 80,051-row public inventory → species, size class, wires present. Proven at median 18.9 m. Claude reasons over the joined record and writes the justification per ticket |
| **Product** | It outputs the *existing* queue, re-ordered. Zero adoption curve — the literal answer to "could they use it Monday?" |
| **Visual** | The re-rank itself. 292 identical `P4` rows, then the order changes and the dangerous ones surface from deep in the list |

## In scope

- Seeded snapshot of the 292 open tree requests (`demo-safe` — **never query live on the demo path**)
- Spatial join to `Public_Trees`, with candidate match distance and uncertainty shown
- Claude-generated risk assessment **with its inputs shown** — species, size class, wires, age of request
- Ranked worklist UI; click a ticket for the reasoning
- Explicit "no asset match" state for rural requests
- Municipal intake preview and simulated receipt with a short overview and a link
  to the full report. A seeded report can drive this flow without a camera pipeline

## Out of scope — decided, not deferred

- **Camera / phone sensors.** Tempting, and it attacks the stated bottleneck, but it costs a 390px layout and a permission-prompt risk on the demo path. Revisit only if the core path is done and hardened before 13:00
- Auth, settings, accounts
- A map as the primary view — the **list** is the product; a map is decoration here
- Any live HRM query during the demo
- Any real municipal request submission, upload, or database write. The prototype
  must provide only a simulated handoff, with no switch that enables live submission
- Historical trend analysis across the 34,860 closed requests

## Honest framing — non-negotiable

This produces a **triage order**, never a safety verdict. We never say a tree is safe, and
we never say a tree will fall. We say: *look at this one before that one, and here is why.*
Say it out loud in the demo before a judge asks.

Use the inventory's published diameter-band labels. Null or unmapped `DBH` values
remain unknown. A nearby asset does not confirm tree identity or report jurisdiction.
See [source corrections](../02-research/03-trees-data-sources.md).

The [teammate workflow review](citizen-report-workflow.md) records proposed citizen
inputs and future operations. It does not add dispatch promises, live notifications,
fleet management, or camera work to this scope.

## Cut ladder for this build

1. Drop the per-ticket reasoning text → show score + inputs only
2. Drop the click-through detail → ranked list only
3. Pre-compute every score at build time → no live model call on the demo path
4. Presenter types instead of judge
