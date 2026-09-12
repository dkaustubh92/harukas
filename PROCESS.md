# HaruKas — Hackathon Runbook

**Claude Hackathon Halifax · Saturday 12 September 2026 · 9:00–17:00 · Volta**

Team: **KD** (technical + business, builds) · **HA** (presentation, language, UI/UX review)

Goal: win. Optimize for demo impact and judge-facing polish, not maintainability.

---

## The four numbers

| | |
|---|---|
| **30%** | Presentation — the largest rubric bucket. HA's lane is not optional |
| **60 min** | The core demo path must work end-to-end by **11:00** |
| **90 sec** | The demo. The **judge types**; the agent responds |
| **14:00** | Freeze. Whatever is live then is what you demo |

Full rubric in `rubric`. Scope rule in `scope-60`. Demo shape in `demo-script-90`.

---

## Timeline

| Time | Block | Who | Skill |
|---|---|---|---|
| 9:00–9:10 | Challenge lands | Both | — |
| 9:10–9:25 | Empathize + research — **hard cap 15 min**. Fan out across candidate challenges in parallel if several are live | Both | `halifax-data` |
| 9:25–9:50 | Interactive ideation | Both | `ideation-grill-me` |
| **9:50–10:00** | **★ KILL GATE** — rubric score, 60-min check, name the 3 WoWs | Both | `rubric`, `scope-60` |
| 10:00–10:15 | **★ 90-second demo script** = the spec | Both | `demo-script-90` |
| 10:00–10:15 | **★ Scaffold + FIRST DEPLOY** — live URL exists | KD | `ship-it` |
| 10:15–10:45 | UI mock → image-gen prompt | HA | `creative-ui-ux-director` |
| 10:15–11:00 | Core path working, **unstyled** | KD | `senior-ai-developer` |
| **11:00** | **SYNC (5 min)** — 60-min rule met? Art direction handed over | Both | `two-lane` |
| 11:00–13:00 | WoW factors + art direction applied | KD | `agentic-ui-ux-designer`, `genui` |
| 10:45–14:00 | Deck, narrative, copy — **parallel lane** | HA | `pitch` |
| **12:30** | **SYNC (10 min)** — score, reallocate to weakest dimension | Both | `rubric` |
| 13:00–14:00 | Demo hardening | Both | `demo-safe` |
| 13:00–14:00 | Q&A prep | HA | `qa-drill` |
| **14:00** | **★ FREEZE + SYNC (30 min)** — rehearse, stop building | Both | `two-lane` |
| 14:00–15:00 | Buffer — **deliberately not build time** | Both | — |
| 15:00–17:00 | Demos + judging | HA presents, KD drives | — |

---

## Challenge selection (9:00–9:10)

Challenges are provided; you pick. This is the highest-leverage decision of the day.

Score each on 1–5:

| Criterion | Ask |
|---|---|
| **Data availability** | Is there a verified public layer? Run `halifax-data` **before** committing |
| **Crowding** | How many of the ~15 teams will pick this? Lower is better |
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
- **Skills, not subagents.** Personas are skills so they run in-session with full context. The only place to fan out to agents is the 9:10–9:25 research block
- **Deploy early and often**, freeze at 14:00

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
