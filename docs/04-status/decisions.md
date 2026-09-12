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

| 12 Sep, ~10:30 | **LOCKED: challenge #3, Which Tree Falls First** | Day-one impact is ×2 and trees answers it literally — 292 real tickets handed back sorted, no adoption needed. Reporting's obvious build needs residents to change behaviour first |
| 12 Sep, ~10:30 | Risk signal comes from the asset inventory, not complaint text | There is no complaint text in the public data. The join is proven: 29/30 within 60 m, median 18.9 m |
| 12 Sep, ~10:30 | Camera path is **out** unless core is hardened before 13:00 | Costs a 390px layout plus permission-prompt risk on the demo path |
| 12 Sep, ~10:30 | Framing is triage order, never a safety verdict | Indefensible otherwise, and a judge will push on it |

## Not yet decided

- Product name — HA's call
- Whether Supabase is needed, or a seeded JSON file is enough (**lean JSON**)
- Whether the build uses a phone sensor path
- Whether Supabase is actually needed, or seeded JSON is enough
