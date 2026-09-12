---
name: demo-script-90
description: Write the 90-second demo script BEFORE any code, then use it as the build spec. Use right after the kill gate, and again before rehearsal. Triggers - "write the demo", "what do we show", "demo script", "how do we present", "what should we build first".
---

# The 90-second script is the spec

Write this **before the first line of code**. It is not a presentation artifact — it is the requirements document. Anything not in it does not get built (`scope-60`).

## The one structural rule

> **The judge types. The agent responds. They watch it happen.**

A live demo where a judge enters their own input and watches an AI agent respond beats a narrated walkthrough every time. It proves the thing is real in a way no slide can.

This is an **architecture constraint**, not a presentation choice. It means: safe for arbitrary input, fast enough to watch, and impossible to break with a typo. Decide it now, not at 14:00.

## The shape

| Beat | Time | Content |
|---|---|---|
| **Hook** | 0:00–0:15 | The problem, as a person feels it. A specific Haligonian, not a statistic. No product name yet |
| **Turn** | 0:15–0:25 | "So we built X." One sentence. What it is, not how |
| **Live demo** | 0:25–1:15 | **The judge types.** Show the WoW factors here — not described, performed |
| **Impact** | 1:15–1:30 | Who this helps, how many, what changes. Real number from real data |

50 of the 90 seconds are live product. If your draft has more talking than showing, cut talking.

## Writing it

1. Write the **Impact** line first — if you can't state it, the idea is weak (`ideation-grill-me`)
2. Write the **Hook** second — it must make the room nod before you name the product
3. Storyboard the **live demo** as literal beats: *judge types "___" → screen shows ___ → agent does ___*
4. Only then does the build list exist: it is exactly the screens and behaviours in step 3

## Rules

- **No architecture talk.** Judges do not score your stack in the demo. That's for Q&A (`qa-drill`)
- **Name the three WoW moments** and mark where each lands in the timeline. If a WoW factor has no timestamp, it doesn't exist
- **Pick the judge's input in advance.** Have 3 suggested prompts visible on screen — it removes the terrifying blank box and keeps you on the happy path without looking scripted
- **Budget for latency.** If a step takes 8 seconds, that's 9% of your demo. Say something during it, or make it faster (`claude-api-demo`)
- **Rehearse to 80 seconds.** Every demo runs long live

## Failure modes

| Symptom | Fix |
|---|---|
| Script is all narration | Move it to the deck; show instead |
| Demo needs 4 clicks of setup | Pre-seed the state |
| "And you could also..." | Cut it. Future work is Q&A material |
| Hook names the product | Rewrite — problem first, always |
