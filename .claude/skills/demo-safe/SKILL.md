---
name: demo-safe
description: Harden the demo path so it cannot fail in front of judges - caching, seeding, fallbacks, and conference-wifi survival. Use from 13:00, and whenever adding anything the demo depends on. Triggers - "what if it breaks", "demo safety", "offline", "fallback", "harden", "wifi".
---

# Demo hardening

Judges have watched demos die. A flawless one is a differentiator by itself — and it's 30% of the rubric (`rubric`).

**Start at 13:00. Not 14:45.**

## The threat model

| Threat | Likelihood | Mitigation |
|---|---|---|
| Conference wifi drops or crawls | **High** | Cache every demo-path response locally |
| Live API slow under room load | **High** | Pre-cache + Fast Mode + low effort |
| Judge types something unexpected | **High** | Suggested prompts + a graceful fallback answer |
| Third-party data source 500s | Medium | Seed the data locally; never query HRM live on the demo path |
| Laptop sleeps / notification overlay | Medium | Disable sleep + Do Not Disturb before demoing |
| Deploy breaks late | Medium | Stop deploying after 14:00; keep localhost as backup |
| Rate limit mid-demo | Low | Pre-warm; don't rehearse against the live path repeatedly |

## Non-negotiables

**1. Seed the data.** Pull what you need from `halifax-data` into Supabase or a local JSON file **during the build**. The demo must not depend on `services2.arcgis.com` responding at 15:40.

**2. Cache the demo-path model responses.** For the 3 suggested prompts, store real responses and serve them instantly. This is not cheating — it's the same output. If a judge types something new, fall through to the live call.

**3. Never render a raw error.** Every failure produces a sentence in your own voice: *"Couldn't reach that dataset — here's the cached view."* A handled failure can even read as polish.

**4. Suggested prompts on screen.** Three of them. Removes the blank-box problem, keeps the judge on the happy path, and doesn't look scripted.

**5. Test the actual conditions.** Tether to a phone hotspot and run the demo. If it survives that, it'll survive the room.

## The 13:00 checklist

- [ ] Demo path runs end-to-end on the **deployed URL**, not localhost
- [ ] Runs with wifi throttled or off (cached path)
- [ ] All three suggested prompts return in under 8 seconds
- [ ] Five weird inputs tried — empty, emoji, a paragraph, SQL, something offensive — none produce a stack trace
- [ ] Every loading state shows real progress (`agentic-ui-ux-designer`)
- [ ] Laptop: sleep off, Do Not Disturb on, notifications silenced, browser zoom set for projection
- [ ] Contrast checked on a projector-like washed-out display
- [ ] Tabs pre-opened, state pre-seeded, one-click to demo start

## The 14:00 freeze

**Stop deploying at 14:00.** Whatever is live at 14:00 is what you demo. The buffer hour is for rehearsal and recovery, not for one more feature — that feature is how teams lose a working demo.
