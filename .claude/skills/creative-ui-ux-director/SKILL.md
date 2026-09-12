---
name: creative-ui-ux-director
description: Owns the VISUAL wow factor - art direction, visual identity, and producing detailed image-generation prompts for UI mockups. Also runs design critique on the built UI. Use for look and feel, colour, type, and "does this look generic". Triggers - "art direction", "make it look good", "mockup prompt", "design review", "visual wow", "does this look templated".
---

# Visual WoW

Owned by HA, working from the deployed URL — never the repo. The output is **direction plus an image-gen prompt**, not code.

## The one-screenshot test

> If someone saw a single frame of this, with no explanation, would they stop scrolling?

That frame is what ends up in the judges' memory and in every photo taken in the room. Design for it deliberately: decide *which* screen is the money shot and make that one excellent rather than spreading effort evenly.

## Anti-template rules

Default AI-app styling is instantly recognizable and reads as low-effort. Break at least three of these defaults:

| Default | Do instead |
|---|---|
| Inter / system font everywhere | One characterful display face for headings; keep body neutral |
| Indigo-500 on white, Tailwind stock | A committed palette — one dominant, one sharp accent |
| Everything in rounded cards on grey | Vary density; let one element break the grid |
| Centered max-w-4xl column | Asymmetry, or full-bleed where the data deserves it |
| Purple-blue AI gradient | Almost anything else |
| Emoji as iconography | Real icons, or none |

**Halifax-specific:** Atlantic palettes (fog, slate, harbour, weathered wood, buoy-orange) read as local and land with a Halifax room far better than generic tech-blue.

## Producing the mockup prompt

KD generates these for HA to run through an image model. A usable prompt names all six:

1. **Screen and purpose** — "the main map view where a resident sees their neighbourhood's service backlog"
2. **Layout** — where things sit, what dominates, what the eye hits first
3. **Palette** — actual colours, not moods
4. **Typography** — display face character, body face, hierarchy
5. **Mood** — three adjectives, and one thing it must *not* look like
6. **Style constraint** — "UI design mockup, flat, high fidelity, no browser chrome, no lorem ipsum"

Generate **2–3 variants** on different directions rather than refining one.

## Critique protocol

HA reviews the deployed URL at each sync. Report findings as **observation → specific fix**, never "make it nicer."

- [ ] **Five-second test** — landing cold, is it obvious what this does?
- [ ] **Money-shot screen** — is there one frame worth photographing?
- [ ] **Type hierarchy** — is there exactly one clear focal point per screen?
- [ ] **Density** — does it feel designed, or auto-generated?
- [ ] **Empty and error states** — do they look intentional?
- [ ] **Motion** — does the agent's work feel alive? (`agentic-ui-ux-designer`)
- [ ] **Contrast** — readable from the back of a room, on a projector that will wash out your greys
- [ ] **Dark mode** — if the venue projector is dark, does it hold up?

## Timing

Direction must land by **10:45** so KD can apply it during the 11:00–13:00 WoW window. Function is built first with default styling; art direction is applied second. **Never block KD's core path on mockups.**
