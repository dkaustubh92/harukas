# Scope — locked at the kill gate

**Challenge: #3 Which Tree Falls First.** Decided 12 Sep 2026, ~10:30. Not revisited.

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
- Spatial join to `Public_Trees`, with match distance surfaced as confidence
- Claude-generated risk assessment **with its inputs shown** — species, size class, wires, age of request
- Ranked worklist UI; click a ticket for the reasoning
- Explicit "no asset match" state for rural requests

## Out of scope — decided, not deferred

- **Camera / phone sensors.** Tempting, and it attacks the stated bottleneck, but it costs a 390px layout and a permission-prompt risk on the demo path. Revisit only if the core path is done and hardened before 13:00
- Auth, settings, accounts
- A map as the primary view — the **list** is the product; a map is decoration here
- Any live HRM query during the demo
- Historical trend analysis across the 34,860 closed requests

## Honest framing — non-negotiable

This produces a **triage order**, never a safety verdict. We never say a tree is safe, and
we never say a tree will fall. We say: *look at this one before that one, and here is why.*
Say it out loud in the demo before a judge asks.

## Cut ladder for this build

1. Drop the per-ticket reasoning text → show score + inputs only
2. Drop the click-through detail → ranked list only
3. Pre-compute every score at build time → no live model call on the demo path
4. Presenter types instead of judge
