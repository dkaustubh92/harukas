# Decision log

One line per decision, newest last. Reason included — a decision without its reason gets
re-litigated at 13:00 when everyone is tired.

Settled stack and standing decisions live in `../01-hackathon/runbook.md`; this file is
for decisions made *on the day*.

| Time | Decision | Reason |
|---|---|---|
| pre-event | Skills, not subagents, for persona work | Skills run in-session with full context; agents start cold and don't make code land faster |
| pre-event | Stack: Next.js + TS + Vercel AI SDK + Supabase → Vercel | Settled; not re-litigated |
| 12 Sep, pre-10:00 | Build window is 10:00–14:00, ideation **inside** it | Front of day cut 60 → 45 min; core path due 11:45 |
| 12 Sep, pre-10:00 | Phone sensors are available but not mandatory | Deployed URL reaches camera/mic/GPS with no extra stack; costs a 390px layout, so only if it's a WoW |
| 12 Sep, 10:00 | Demo budget is **3 min**, not 90 sec | Stated at the briefing |
| 12 Sep, 10:00 | Rubric: day-one impact ×2; product, idea, demo ×1 each | From the judging slide — overrides the `rubric` skill's assumed weights |
| 12 Sep, 10:xx | Docs consolidated under `docs/` | Four numbered folders; root keeps only CLAUDE.md, AGENTS.md, README.md |

| 12 Sep, ~10:15 | Research: trees PURSUE, reporting PASS | Data verified live. Trees has 292 open tickets with 87% at one priority and an 80K-tree asset inventory nobody joins. Reporting's obvious build needs an adoption curve, which fails the ×2 Monday criterion |

## Not yet decided

- **Which challenge.** Nothing claimed on the board — recommendation is trees
- Whether the build uses a phone sensor path
- Whether Supabase is actually needed, or seeded JSON is enough
