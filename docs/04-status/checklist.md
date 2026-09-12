# Status

**Last updated: 12 Sep 2026, ~10:30 — challenge locked.** Update the timestamp when you
touch this — a stale status file is worse than none.

## Right now

**Challenge locked: #3 Which Tree Falls First.** Scope in `docs/03-requirements/scope.md`.

**Next two actions, in order:**
1. **Put HaruKas on the board against #3** — four teams per problem, first-come
2. **Create the Vercel project** — the only step that can't be done from this repo

## Prep — done before the event

- [x] 17 skills in `.claude/skills/`
- [x] Runbook, rubric, and challenges captured in `docs/01-hackathon/`
- [x] Next.js scaffold builds clean (`npm run build`) — `/` and `/api/chat`
- [x] `ANTHROPIC_API_KEY` set in `.env.local`
- [x] GitHub remote: `dkaustubh92/harukas`
- [x] QR share overlay (press `Q`) reads the live URL from `window.location`

## Today

### Pick (10:00–10:45)
- [x] Research block — trees PURSUE, reporting PASS (`docs/02-research/`)
- [x] Data gate passed — join proven, 29/30 within 60 m, median 18.9 m
- [x] Kill gate — Monday person and 3 WoWs named in `docs/03-requirements/scope.md`
- [ ] **Claim #3 on the board** — four teams each, first-come
- [ ] Demo script written → `docs/03-requirements/demo-script.md`

### Build (10:45–14:00)
- [ ] **Vercel project created — live URL exists.** Manual step at vercel.com/new; the only
      thing that can't be done from this repo. Do it first
- [ ] Env vars set in Vercel (separate from `.env.local`)
- [ ] Core path works end-to-end, unstyled — **due 11:45**
- [ ] Art direction applied
- [ ] WoW factors in
- [ ] Demo path hardened and seeded (`demo-safe`)

### Freeze (14:00)
- [ ] Rehearsed on the actual demo device, on the actual venue wifi
- [ ] Fallback ready if the live path fails
- [ ] Q&A prep done

## Known risks

| Risk | State |
|---|---|
| **Not deployed.** No live URL; QR overlay points at `localhost` | **Open — highest priority once we pick** |
| Conference wifi | Untested. Seed the demo path, don't query live (`demo-safe`) |
| `demo-script-90` is written for 90 sec, budget is 3 min | Known; adjust when writing the script |
| `DBH` is a size class 1–11, not centimetres | Render as relative size only. Never print "4 cm" |
| Rural requests have no asset match (1 in 30) | Explicit empty state — a non-match is itself a signal |
