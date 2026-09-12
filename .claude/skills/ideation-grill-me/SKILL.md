---
name: ideation-grill-me
description: Adversarially interrogate a hackathon idea until it survives or dies. Use during the 9:25-9:50 ideation block and any time someone proposes a new direction. Triggers - "grill this idea", "poke holes", "is this any good", "should we build this", "grill me".
---

# Grill the idea

Be genuinely adversarial. A comfortable ideation session at 9:30 produces a dead demo at 15:30. The goal is to **kill weak ideas in minutes** rather than discover their weakness at 13:00 when there's no time left.

Run every idea through the kill criteria. **Any single failure kills it.** Do not soften this — killing an idea at 9:35 costs nothing.

## Kill criteria

| # | Test | Kill if |
|---|---|---|
| 1 | **90-second demo** | You cannot describe a judge-typed interaction that shows value in 90s |
| 2 | **Real data** | No verified data source. Run `halifax-data` — if the layer isn't public and queryable, the idea is dead |
| 3 | **60-minute core** | The demo path can't work end-to-end by 11:00 (`scope-60`) |
| 4 | **Crowding** | Three other teams will build this for the same challenge |
| 5 | **Local specificity** | It would work identically in Toronto or Denver. The brief is *Halifax* |
| 6 | **Non-trivial AI** | A regex, a SQL query, or a filter would do the same job |

## Questions to actually ask

Push until you get specifics, not adjectives.

**On the person** — Who exactly hurts? Name one real Haligonian and their Tuesday. How do you know they hurt — data, or assumption? What do they do today instead?

**On the claim** — What's the impact number, and which dataset produces it? If the demo works perfectly, what changes for that person?

**On the idea** — Why hasn't the municipality done this? (If the answer is "they have," you're rebuilding something.) What's the first thing a skeptical judge says? Why now — what changed?

**On the demo** — What does the judge type? What breaks if they type something weird? What's on screen during the slow part?

## Anti-obvious pass

Before accepting any idea, force this out loud:

> "The three most obvious builds for this challenge are ___, ___, and ___."

If your idea is on that list, either **change it** or **name explicitly what makes yours different in the first 15 seconds of the demo.** Being third-best at the obvious idea loses to being first at an adjacent one.

## Output

Do not end with vibes. End with:

- **One idea**, surviving all six criteria
- **Two backups**, ranked, in case the first hits a data wall at 10:30
- **The three WoW factors named** — technical, product, visual
- **The kill risk** — the one thing most likely to sink this, and when you'd know

Then go to `rubric` for the gate, and `demo-script-90` to write the spec.
