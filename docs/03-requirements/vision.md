# Product vision — KD, captured ~10:35, 12 Sep 2026

**Status: captured, not scoped.** This is the full ambition as dictated. The locked build
scope is in `scope.md` and has not changed. Research pass and scope reconciliation come
next, when KD calls it.

---

## The shape: two users, one system

### Citizens / public — **one page, no more**

A single main app. Deliberately simple, two things to do:

1. **What's around me** — a map showing existing damage and what's been reported nearby.
   A high-level list of what's been reported and where. Notifications based on the user's
   location. The point is helping a resident *decide*: which road to drive, whether the
   thing near the house is being dealt with. Also shows **whether government is acting** —
   the priority list, status of reports
2. **Report it** — one button pops the camera. Photo plus additional information: GPS
   location, or typed detail if they prefer

### Government officials

The analysis surface. Receives the citizen reports plus everything else, and produces
**analysis, reporting, and an automated priority order**.

> **The human is the action-taker.** The system proposes the priority; an official
> accepts, rejects, or acts. Not an autonomous decision-maker.

---

## Data to pull together

| Source | Notes |
|---|---|
| Map | Base layer |
| **Population density** | Who is exposed |
| **Tree data** | Already verified — `Public_Trees`, 80,051 rows |
| **Weather data** | Including forecast, not just current |
| **Electricity pole and line data** | Proximity to infrastructure |
| **Images sent by users** | The citizen reporting loop feeds the analysis |

## Analysis on the image

- Image → matrix
- **Type** of tree
- **Height** of tree
- **Proximity**: near a road? near a property? near an electricity pole or line?

## Additional factor

- **Weather prediction** — is it risky to leave this as it is? Forecast turns a static
  condition into a time-sensitive one

## Predict the negative impact

Not just "this tree is risky" — *what happens to the city if nothing is done*:

- **Road blocked** — which roads
- **Electricity outage** — which area loses power
- **Property damage**
- Which **neighbourhoods get disrupted**

This impact model is what drives the prioritization.

---

## Look and feel

**Beautiful, 3D, interactive.** Explicitly a priority, not a nice-to-have.

- Heaviest visual investment on the **reporting / citizen side**
- **Impact shown as a scenario on a 3D map** — "if this falls, here's what happens." Be
  creative here
- **Few pages.** Citizens get one. Resist adding surfaces

---

# Open questions for the research pass

Recorded so the research block has a list, not a blank page. **None of these are objections
— they're the things that decide what survives contact with the clock.**

## Data availability (gates — verify before designing around them)

- **Electricity poles and lines.** These are likely **NS Power** assets, not HRM. HRM open
  data may carry street lights (46,490 rows, verified) but that is not the distribution
  network. If the pole/line layer doesn't exist publicly, the `WIRES` flag already on each
  tree record is the fallback — it is per-tree and already proven
- **Weather forecast** — needs a real source (Environment Canada). Is it CORS-open?
- **Population density** — census DA-level. `Tree_Equity_Score_by_DA` (609 rows) is already
  DA-shaped and may carry it
- **Road network** — `StreetNetwork` (18,640) and `Street_Name_Routes` (6,883) both verified

## Technical honesty

- **Height from a single photo is unreliable.** Monocular height estimation without a
  reference object is a known-hard problem. Either avoid claiming a number, use a coarse
  band, or ask the user for a reference. The tree inventory already carries a **size class
  1–11**, which is more defensible than anything inferred from a photo
- **"Image to matrix"** — worth pinning down what this means in practice. Claude vision
  reads the photo directly; a separate matrix/embedding step may not be needed
- **Predicting which roads block / who loses power** is a real modelling claim. Decide
  whether it is *computed* (defensible, needs the network data) or *illustrative* (a
  scenario visualization, which must be labelled as such). **Do not blur the two in front
  of judges**

## Scope reconciliation — the big one

The locked scope (`scope.md`) is one ranked worklist. This vision is **two user types, a
camera pipeline, a 3D map, an impact model, and a notification system.**

Build window ends **14:00**. This does not fit, and the rubric explicitly rewards the
smaller thing: *"A focused thing that works beats an ambitious thing that crashes."*

The reconciliation is not "cut the vision" — it is **choose which slice gets built and let
the rest be the roadmap the pitch points at.** That is a legitimate and strong demo
structure. Decide the slice at the next sync, with `scope-60`.
