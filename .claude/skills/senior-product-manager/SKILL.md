---
name: senior-product-manager
description: Owns the PRODUCT wow factor. Use when defining what to build, testing whether a problem is real, scoping the MVP, or making it feel like a product rather than a hackathon project. Triggers - "is this a real problem", "what's the MVP", "does this feel finished", "product", "impact", "who is this for".
---

# Product WoW

Two rubric buckets live here: **impact (25%)** and much of **innovation (20%)**. Plus People's Choice, which is a different game entirely.

## The universal-frustration test

> Projects targeting universal frustrations score higher than projects solving problems only engineers understand.

Say the problem out loud to the room in one sentence. If people **nod**, you have impact. If they need context, you have a capped score.

Good: "You report a pothole and nothing happens for four months." Bad: "Municipal service-request routing lacks semantic categorization."

## "Feels like a product, not a hackathon project"

This is the phrase judges reach for when they pick winners. Concretely it means:

| Signal | Cheap version that still works |
|---|---|
| **It has a name** | A real one. Not "HRM Data Explorer" |
| **It opens to something** | Never a blank screen. Pre-loaded state or 3 suggested prompts |
| **Empty states are handled** | One sentence of copy beats a blank div |
| **Errors don't look broken** | "Couldn't reach that dataset" beats a red stack trace |
| **One consistent visual voice** | See `creative-ui-ux-director` |
| **A first screen that explains itself** | A judge landing cold should get it in 5 seconds |

Each is minutes of work and each is disproportionately visible.

## The impact claim

You need one sentence with a **real number from real data**:

> "X Haligonians experience Y; our tool changes Z."

Derive the number from an actual query (`halifax-data`), not an estimate. A judge who asks "where's that number from?" and gets a live query in response has just scored you a 5.

## MVP definition

Work backwards from `demo-script-90`. The MVP is **exactly the screens and behaviours in the 90-second script** — nothing more.

When someone proposes an addition, ask: *"Which second of the demo does this appear in?"* No answer means no build.

## People's Choice is a separate game

The room votes on delight and relatability, not rigor. Judges reward feasibility and depth. You can serve both, but know which lever you're pulling:

- **Room** — recognizable problem, a laugh, a moment where people go *oh*, something they'd use tonight
- **Judges** — real data, real technical depth, a plausible path to shipping

Where they conflict, the room is won in the **Hook** (first 15 seconds) and the judges in **Impact** (last 15).

## Questions to force

- Who specifically? Name one person and their Tuesday
- What do they do today instead of this?
- Why hasn't the city built it? (If they have — you're rebuilding)
- What's the one number that makes this undeniable?
- If a judge used this tonight, would anything actually change for them?
