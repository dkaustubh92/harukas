# HaruKas

Hackathon prototype — Claude Hackathon Halifax, 12 Sept 2026. Read `PROCESS.md` for the day's runbook.

## Context that changes how you work here

This is a **4-hour hackathon build judged by a live demo**, not a product. Optimize for demo impact, not maintainability. Speed and visible polish beat correctness at the margins.

- **If it isn't in the 90-second demo, don't build it.** See `scope-60`
- **Deploy early and continuously.** Not at the end. See `ship-it`
- **No auth, no settings, no responsive work** unless the demo shows it
- Ugly-but-working beats elegant-but-unfinished

## Stack (settled — do not re-litigate)

Next.js (App Router) · TypeScript · Vercel AI SDK · Supabase · deployed on Vercel via GitHub.

## Model routing

| Context | Model |
|---|---|
| **In the app** | `claude-opus-5` |
| Claude Code — ideation, planning, creative | `claude-fable-5-1` |
| Claude Code — coding | `claude-opus-5` at `xhigh` effort |

**Never put `claude-fable-5-1` in the app's request path** — forced tool use returns 400 (breaks generative UI), turns can run minutes, and it costs 2× Opus 5. Details in `claude-api-demo`.

## Team

**KD** writes all the code. **HA** owns presentation, copy, and UI/UX review, and **never touches the repo** — HA works from the deployed URL. See `two-lane`.

## Skills

17 skills in `.claude/skills/`. The load-bearing ones:

| Phase | Skills |
|---|---|
| Ideation | `ideation-grill-me`, `rubric`, `scope-60`, `demo-script-90` |
| WoW factors | `senior-ai-developer` (technical), `senior-product-manager` (product), `creative-ui-ux-director` (visual) |
| Build | `halifax-data`, `genui`, `agentic-ui-ux-designer`, `claude-api-demo`, `supabase-sprint`, `ship-it` |
| Demo | `demo-safe`, `pitch`, `qa-drill` |
| Coordination | `two-lane` |

## Data

Halifax open data is **verified and catalogued** in `halifax-data` — 339 public queryable layers, no auth, CORS open. Use `find.py` rather than guessing URLs. Do not query it live on the demo path; seed it (`demo-safe`).

## Secrets

`ANTHROPIC_API_KEY` and `SUPABASE_SERVICE_ROLE_KEY` are **server-only** — never `NEXT_PUBLIC_`. Claude calls go through a server route.
