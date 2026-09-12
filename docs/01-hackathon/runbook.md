# HaruKas — Hackathon Runbook

**Claude Hackathon Halifax · Saturday 12 September 2026 · Volta**

**Build window: 10:00–14:00.** Demos 15:00–17:00.

Team: **KD** (technical + business, builds) · **HA** (presentation, language, UI/UX review)

Goal: win. Optimize for demo impact and judge-facing polish, not maintainability.

---

## The four numbers

| | |
|---|---|
| **×2** | Day-one impact — *could they use it Monday?* Double-weighted, the largest bucket by far. Full rubric in `docs/01-hackathon/challenges.md` |
| **75 min** | The working webapp path must work end-to-end by minute 75 of the implementation block |
| **Remaining time** | Use the time left before the hard cutoff for polish, hardening, and rehearsal |
| **3 min** | The demo (**not 90 sec**). Judged on one thing: *are the problem and outcome obvious?* |
| **14:00** | Freeze. Whatever is live then is what you demo |

Rubric is in `docs/01-hackathon/challenges.md` and **overrides the `rubric` skill's assumed weights**. The current requirements gate below supersedes the older scope notes. `demo-script.md` remains a rehearsal aid subordinate to the canonical requirements.

The five challenges and the judges' three stated questions are in `docs/01-hackathon/challenges.md`. Read it before ideation.

---

## Historical day timeline (pre-override)

| Time | Block | Who | Skill |
|---|---|---|---|
| 10:00–10:10 | Challenge lands + pick — **four teams per problem, first to the board gets it**. Claim early | Both | `docs/01-hackathon/challenges.md` |
| 10:10–10:25 | Empathize + research — **hard cap 15 min**. Fan out across candidate challenges in parallel if several are live | Both | `halifax-data` |
| 10:25–10:40 | Interactive ideation — **15 min, not 25** | Both | `ideation-grill-me` |
| **10:40–10:45** | **★ KILL GATE** — rubric score, name the 3 WoWs | Both | `rubric`, `scope-60` |
| 10:45–11:00 | Draft the three-minute demo narrative | Both | `demo-script-90` |
| 10:45–11:00 | **★ Scaffold + FIRST DEPLOY** — live URL exists | KD | `ship-it` |
| 11:00–11:30 | UI mock → image-gen prompt | HA | `creative-ui-ux-director` |
| 11:00–11:45 | Core path working, **unstyled** | KD | `senior-ai-developer` |
| **11:45** | **SYNC (5 min)** — hand off the art direction and check the current build gate | Both | `two-lane` |
| 11:45–13:00 | WoW factors + art direction applied | KD | `agentic-ui-ux-designer`, `genui` |
| 11:30–14:00 | Deck, narrative, copy — **parallel lane** | HA | `pitch` |
| **12:45** | **SYNC (10 min)** — score, reallocate to weakest dimension | Both | `rubric` |
| 13:00–14:00 | Demo hardening | Both | `demo-safe` |
| 13:00–14:00 | Q&A prep | HA | `qa-drill` |
| **14:00** | **★ FREEZE + SYNC (30 min)** — rehearse, stop building | Both | `two-lane` |
| 14:00–15:00 | Buffer — **deliberately not build time** | Both | — |
| 15:00–17:00 | Demos + judging | HA presents, KD drives | — |

Ideation happens **inside** the build window, so it is cut to 45 minutes end-to-end (was 60). The kill gate is 5 minutes, not 10 — score, decide, move. If the challenge is published before 10:00, run the 10:00–10:45 block early and hand those 45 minutes back to the build.

---

## Requirements gate

Complete and review the canonical requirements before development:

- [Product requirements](../03-requirements/product-requirements.md)
- [Technical contract](../03-requirements/technical-contract.md)
- [Acceptance checklist](../03-requirements/acceptance-checklist.md)
- [Execution plan](../03-requirements/execution-plan.md)

These documents define the current product. Older `scope.md` provides historical context. `demo-script.md` is a rehearsal aid subordinate to the canonical requirements.

---

## Current build override

The current repository is still a generic Next.js chat scaffold. The tree-report and queue flows are unbuilt. Complete the requirements gate before starting development. The [canonical execution plan](../03-requirements/execution-plan.md) defines the build sequence and cut order. Target a working path by minute 75, then use the remaining time for polish, hardening, and rehearsal. The hard **14:00** cutoff overrides every relative target.

The target app model is OpenRouter `openai/gpt-5.6-luna` with high reasoning effort. Route every app LLM request through the server using `OPENROUTER_API_KEY`; the model accepts text and image input, and the key never reaches the browser. The current scaffold route still uses Anthropic until development replaces it. `@next/env` detects `OPENROUTER_API_KEY` in the current local setup. Keep a deterministic seeded path so a failed model request does not break the demo.

The Supabase project is `mgelmrwklixmhdhfxypk`, and the local Supabase URL matches it. The GitHub repository is `dkaustubh92/harukas`. `SUPABASE_SERVICE_ROLE_KEY` is absent and remains a setup dependency before any backend write. No backend write has been tested.

The prototype never creates a real municipal request, uploads or sends a report to Halifax or Nova Scotia Power, dispatches a crew, or notifies a person. Use simulated receipts and label them as not sent.

Native mobile app work, native camera capture, weather, PDF export, fleet routing, SMS or email, and real integrations remain deferred. Shared persistence across the phone, laptop, and refresh is P0. Browser photo selection and consented current-location access are P0. Tilted maps and 3D buildings are optional P1 improvements. A seeded image fallback keeps the current path reliable.

---

## Challenge selection (10:00–10:10)

Challenges are provided; you pick. This is the highest-leverage decision of the day.

Score each on 1–5:

| Criterion | Ask |
|---|---|
| **Data availability** | Is there a verified public layer? Run `halifax-data` **before** committing |
| **Crowding** | Capped at four teams per problem. Assume all four slots fill on the popular ones |
| **Demoability** | Can a judge type something and see value in 3 minutes? |
| **Local resonance** | Will a Halifax judge feel this personally? |
| **Our edge** | Do we know something about this domain others don't? |

Data availability is a **gate, not a score** — no verified public data, don't pick it.

---

## Anti-obvious check (during ideation)

Before locking an idea, say out loud:

> "The three most obvious builds for this challenge are ___, ___, and ___."

If yours is on that list, change it, or name explicitly what makes yours different **in the first 15 seconds of the demo**. Being third-best at the obvious idea loses.

---

## Panic protocol

When a checkpoint slips, follow the canonical acceptance checklist and execution plan. Cut unfinished work and keep moving.

1. **Cut scope** — one fewer feature
2. **Cut fidelity** — real-time → on-click; live → pre-cached
3. **Cut generality** — all inputs → the three the judge will type
4. **Cut interaction** — judge types → presenter types
5. **Cut liveness** — live → recorded

Rungs 3 and 4 are nearly invisible in a three-minute demo. Reach for them early.

**At 14:00, whatever is unfinished is cut.** No exceptions — this is the rule that protects the demo.

---

## Standing decisions

- **Stack:** Next.js + TypeScript + Vercel AI SDK + Supabase → Vercel. Settled; do not re-litigate
- **Target app model configuration:** OpenRouter `openai/gpt-5.6-luna` with high reasoning effort. It accepts text and image input. The current scaffold route still uses Anthropic until development replaces it.
- **Agent model selection:** Separate from app routing; use the model and reasoning settings supplied by the current task
- **HA never touches the repo** — works from the deployed URL (`two-lane`)
- **Bounded delegation:** Luna max subagents may own independent UI or verification tasks in separate files. The app uses Luna high through OpenRouter. Keep shared types, global styles, package files, and integration with the integrating agent.
- **Deploy early and often**, freeze at 14:00
- **End the demo on the QR screen** (press `Q`) — live app + GitHub, side by side. Leave it up through Q&A and voting. Built into the app, so it always shows the real deployed URL
- **Browser image and location input are part of the app path.** Use a file input with a seeded fallback and request current location only after explicit consent. Native mobile, camera, microphone, and motion permissions remain deferred.

---

## Phone as an input device

The QR screen puts the live URL on a judge's phone. The current path uses a browser file input and an explicit-consent current-location option with a seeded fallback. Native mobile sensors remain future options because their permission prompts and narrow layouts add demo risk.

| Sensor | Web API | Good for |
|---|---|---|
| Camera | `getUserMedia`, or `<input type="file" capture>` | Photograph a thing in the world, feed the frame to the OpenRouter model |
| Mic | `getUserMedia`, Web Speech API | Speak instead of type — removes the keyboard from the demo |
| Location | `navigator.geolocation` | Consent-based current location for "what's happening on *my* street" |
| Motion / orientation | `DeviceMotionEvent`, `DeviceOrientationEvent` | Rare, usually a gimmick — needs a real reason |

**If you use one, these four will bite:**

1. **HTTPS only.** All of the above need a secure context. The Vercel URL works; a phone hitting your laptop's LAN IP over `http://` does **not**. Deploy first, then test on the phone — do not try to debug this on localhost
2. **Permission prompts sit on the demo path.** Pre-grant on the exact device you will demo with, and rehearse on that device (`demo-safe`). A cold prompt in front of judges costs ten seconds and all your momentum
3. **iOS motion needs a gesture.** `DeviceOrientationEvent.requestPermission()` must be called from a real tap or it silently does nothing. Camera and mic are the safer bets
4. **Seed a fallback.** A canned photo that drives the identical code path if image capture fails — rung 2 of the cut ladder, decided in advance rather than on stage

**Cost check:** a native phone path means the UI must work at 390px wide, which adds layout work. The P0 browser inputs do not require a native mobile app. Add native sensors only if a later decision makes one a WoW.

---

## Post-demo: open-sourcing (17:00+)

**The repo is public from day one**, so this is mostly already true. What's left is making it legally open, usable, and safe.

### The one thing that can't wait

**Never commit a real key.** A leaked key in a public repo is exposed the moment it's pushed — not at 17:00. Use `.env.local` (gitignored) locally and the Vercel dashboard in production. If a key ever does get committed, **rotate it**; deleting the commit is not enough, because the history is already public.

### Release checklist

- [ ] `git log -p | grep -iE "sk-ant|sk-or-v1|eyJ|service_role"` — confirm no key ever entered history
- [ ] Rotate `OPENROUTER_API_KEY` and the Supabase service-role key if either was exposed
- [ ] Keep the description and impact sentence in `README.md` aligned with the shipped behaviour
- [ ] Add a screenshot or a short demo GIF to the README — this is what makes a repo worth starring
- [ ] Confirm the HRM data attribution line is present and accurate
- [ ] Add repo topics on GitHub: `halifax`, `civic-tech`, `open-data`, `claude`, `hackathon`
- [ ] Link the live Vercel URL in the repo description

### It's also a judging asset

"This is open source — the municipality could fork it on Monday" is the strongest available answer to *"what's the adoption path?"* (`qa-drill`). Worth saying out loud in the demo or Q&A, not just doing quietly afterwards.
