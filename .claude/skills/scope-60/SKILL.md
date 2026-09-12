---
name: scope-60
description: Enforce hackathon scope discipline against the clock. Use at the kill gate to test feasibility, whenever someone proposes adding a feature, and at any checkpoint that slips. Triggers - "can we build this in time", "should we add", "are we on track", "what do we cut".
---

# The 60-minute rule

Build window is **10:00–14:00** (240 min; 15:00 is the hard stop, not the plan).

> **The core demo path must work end-to-end by 11:00 — the first 25% of the clock.**

Everything after 11:00 is WoW, polish, hardening and rehearsal. This is not pessimism; it is the single strongest predictor of finishing.

## Applying it at the kill gate

Take the 90-second demo script (`demo-script-90`) and ask of each beat: *can this beat work, unstyled, in 60 minutes?*

Ugly-but-working counts. Styling, animation, empty states, auth, settings, responsive — none of that is in the 60.

If the answer is no, **the idea changes, not the deadline.**

## What is never in the 60 minutes

Auth · user accounts · databases you don't need · settings · onboarding · responsive layout · error handling beyond "don't crash" · anything the 90-second script doesn't show.

**If it isn't on screen during the demo, it does not get built.**

## Cut ladder

Apply top-down the moment a checkpoint slips:

1. **Cut scope** — one fewer feature, one fewer screen
2. **Cut fidelity** — real-time becomes on-click; live query becomes pre-cached
3. **Cut generality** — works for all inputs becomes works for the three the judge will type
4. **Cut interaction** — judge types becomes presenter types
5. **Cut liveness** — live becomes recorded

Rungs 3 and 4 are cheap and almost invisible in a 90-second demo. Reach for them early rather than heroically defending scope.

## Checkpoints

| Time | Must be true | If not |
|---|---|---|
| **11:00** | Core path works end-to-end, unstyled | Cut one rung. Do not "push through" |
| **12:30** | One WoW factor visibly working | Drop the second WoW |
| **14:00** | Deployed, rehearsed, backed up | Stop building. Anything unfinished is now cut |

**14:00–15:00 is buffer, not build time.** Teams that treat it as build time demo something broken.
