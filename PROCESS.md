# HaruKas — Hackathon Runbook

**Claude Hackathon Halifax · Saturday 12 September 2026 · Volta**

**Build window: 10:00–14:00.** Demos 15:00–17:00.

Team: **KD** (technical + business, builds) · **HA** (presentation, language, UI/UX review)

Goal: win. Optimize for demo impact and judge-facing polish, not maintainability.

---

## The four numbers

| | |
|---|---|
| **×2** | Day-one impact — *could they use it Monday?* Double-weighted, the largest bucket by far. Full rubric in `CHALLENGES.md` |
| **60 min** | The core demo path must work end-to-end by **11:45** — 60 min after ideation ends |
| **3 min** | The demo (**not 90 sec**). Judged on one thing: *are the problem and outcome obvious?* |
| **14:00** | Freeze. Whatever is live then is what you demo |

Rubric is in `CHALLENGES.md` and **overrides the `rubric` skill's assumed weights**. Scope rule in `scope-60`. Demo shape in `demo-script-90` — **written for 90 sec, real budget is 3 min**.

The five challenges and the judges' three stated questions are in `CHALLENGES.md`. Read it before ideation.

---

## Timeline

| Time | Block | Who | Skill |
|---|---|---|---|
| 10:00–10:10 | Challenge lands + pick — **four teams per problem, first to the board gets it**. Claim early | Both | `CHALLENGES.md` |
| 10:10–10:25 | Empathize + research — **hard cap 15 min**. Fan out across candidate challenges in parallel if several are live | Both | `halifax-data` |
| 10:25–10:40 | Interactive ideation — **15 min, not 25** | Both | `ideation-grill-me` |
| **10:40–10:45** | **★ KILL GATE** — rubric score, 60-min check, name the 3 WoWs | Both | `rubric`, `scope-60` |
| 10:45–11:00 | **★ 3-minute demo script** = the spec | Both | `demo-script-90` |
| 10:45–11:00 | **★ Scaffold + FIRST DEPLOY** — live URL exists | KD | `ship-it` |
| 11:00–11:30 | UI mock → image-gen prompt | HA | `creative-ui-ux-director` |
| 11:00–11:45 | Core path working, **unstyled** | KD | `senior-ai-developer` |
| **11:45** | **SYNC (5 min)** — 60-min rule met? Art direction handed over | Both | `two-lane` |
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

## Challenge selection (10:00–10:10)

Challenges are provided; you pick. This is the highest-leverage decision of the day.

Score each on 1–5:

| Criterion | Ask |
|---|---|
| **Data availability** | Is there a verified public layer? Run `halifax-data` **before** committing |
| **Crowding** | Capped at four teams per problem. Assume all four slots fill on the popular ones |
| **Demoability** | Can a judge type something and see value in 90 seconds? |
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

When a checkpoint slips, apply the cut ladder top-down (`scope-60`). Do not deliberate — cut and keep moving.

1. **Cut scope** — one fewer feature
2. **Cut fidelity** — real-time → on-click; live → pre-cached
3. **Cut generality** — all inputs → the three the judge will type
4. **Cut interaction** — judge types → presenter types
5. **Cut liveness** — live → recorded

Rungs 3 and 4 are nearly invisible in 90 seconds. Reach for them early.

**At 14:00, whatever is unfinished is cut.** No exceptions — this is the rule that protects the demo.

---

## Standing decisions

- **Stack:** Next.js + TypeScript + Vercel AI SDK + Supabase → Vercel. Settled; do not re-litigate
- **Model in the app:** `claude-opus-5`. **Not** `claude-fable-5-1` — 2× cost, multi-minute turns, and forced tool use returns 400 (`claude-api-demo`)
- **Model in Claude Code:** Fable 5.1 for ideation/planning/creative; Opus 5 `xhigh` for coding
- **HA never touches the repo** — works from the deployed URL (`two-lane`)
- **Skills, not subagents.** Personas are skills so they run in-session with full context. The only place to fan out to agents is the 10:10–10:25 research block
- **Deploy early and often**, freeze at 14:00
- **End the demo on the QR screen** (press `Q`) — live app + GitHub, side by side. Leave it up through Q&A and voting. Built into the app, so it always shows the real deployed URL
- **Phone sensors are on the table.** The deployed URL opens on a phone, so camera, mic, geolocation and motion are reachable from the browser — no native app, no extra stack. Use one only if it *is* a WoW; see below

---

## Phone as an input device

The QR screen already puts the live URL on a judge's phone. That makes *"scan this and point your camera at it"* a closing move a slide deck cannot match — the judge holds the product. Consider it when the challenge involves something physical, situated, or spoken:

| Sensor | Web API | Good for |
|---|---|---|
| Camera | `getUserMedia`, or `<input type="file" capture>` | Photograph a thing in the world, feed the frame to Claude vision |
| Mic | `getUserMedia`, Web Speech API | Speak instead of type — removes the keyboard from the demo |
| Location | `navigator.geolocation` | "What's happening on *my* street" against HRM layers |
| Motion / orientation | `DeviceMotionEvent`, `DeviceOrientationEvent` | Rare, usually a gimmick — needs a real reason |

**If you use one, these four will bite:**

1. **HTTPS only.** All of the above need a secure context. The Vercel URL works; a phone hitting your laptop's LAN IP over `http://` does **not**. Deploy first, then test on the phone — do not try to debug this on localhost
2. **Permission prompts sit on the demo path.** Pre-grant on the exact device you will demo with, and rehearse on that device (`demo-safe`). A cold prompt in front of judges costs ten seconds and all your momentum
3. **iOS motion needs a gesture.** `DeviceOrientationEvent.requestPermission()` must be called from a real tap or it silently does nothing. Camera and mic are the safer bets
4. **Seed a fallback.** A canned photo or clip that drives the identical code path if the camera fails — rung 2 of the cut ladder, decided in advance rather than on stage

**Cost check:** a phone path means the UI must work at 390px wide, which contradicts "no responsive work" in `CLAUDE.md`. That is a real cost — take it only if the sensor *is* one of the three WoWs, not as a garnish.

---

## Post-demo: open-sourcing (17:00+)

**The repo is public from day one**, so this is mostly already true. What's left is making it legally open, usable, and safe.

### The one thing that can't wait

**Never commit a real key.** A leaked key in a public repo is exposed the moment it's pushed — not at 17:00. Use `.env.local` (gitignored) locally and the Vercel dashboard in production. If a key ever does get committed, **rotate it**; deleting the commit is not enough, because the history is already public.

### Release checklist

- [ ] `git log -p | grep -iE "sk-ant|eyJ|service_role"` — confirm no key ever entered history
- [ ] Rotate `ANTHROPIC_API_KEY` and the Supabase service-role key anyway, as a precaution
- [ ] Fill in the `TODO` sections of `README.md` — what it does, and the impact sentence from the pitch
- [ ] Add a screenshot or a short demo GIF to the README — this is what makes a repo worth starring
- [ ] Confirm the HRM data attribution line is present and accurate
- [ ] Add repo topics on GitHub: `halifax`, `civic-tech`, `open-data`, `claude`, `hackathon`
- [ ] Link the live Vercel URL in the repo description

### It's also a judging asset

"This is open source — the municipality could fork it on Monday" is the strongest available answer to *"what's the adoption path?"* (`qa-drill`). Worth saying out loud in the demo or Q&A, not just doing quietly afterwards.
