# Status

**Last updated: 12 Sep 2026, before the research block.** Update the timestamp when you
touch this — a stale status file is worse than none.

## Right now

**Blocked on nothing. Next action: the 15-minute research block, then claim a problem.**

## Prep — done before the event

- [x] 17 skills in `.claude/skills/`
- [x] Runbook, rubric, and challenges captured in `docs/01-hackathon/`
- [x] Next.js scaffold builds clean (`npm run build`) — `/` and `/api/chat`
- [x] `ANTHROPIC_API_KEY` set in `.env.local`
- [x] GitHub remote: `dkaustubh92/harukas`
- [x] QR share overlay (press `Q`) reads the live URL from `window.location`

## Today

### Pick (10:00–10:45)
- [ ] Research block — 15 min hard cap, notes in `docs/02-research/`
- [ ] **Claim a problem on the board** — four teams each, first-come
- [ ] Kill gate — score against the real rubric, name the Monday person, name the 3 WoWs
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
