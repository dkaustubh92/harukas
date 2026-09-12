---
name: two-lane
description: Parallel working protocol for the 2-person team - KD builds, HA pitches, neither blocks the other. Use at the start of the build and at each sync point. Triggers - "who does what", "sync", "what should HA do", "are we coordinated", "lanes".
---

# Two lanes

**KD** — technical + business. The only person writing code, so KD's throughput is the binding constraint on the entire day.
**HA** — presentation, language, UI/UX review. Separate device.

The failure mode for a 2-person team is HA watching KD code. Presentation is **30% of the rubric** — the largest bucket — so an idle HA is the most expensive mistake available.

## The rule

> **HA never touches the repo.** HA works from the deployed URL and screenshots.

No merge conflicts, no "can you pull", no blocking. HA runs their own Claude Code session on their own device with the Lane B skills.

## Lanes

| | Lane A — KD | Lane B — HA |
|---|---|---|
| **Window** | 10:00–14:00 heads-down | 10:15–14:00 in parallel |
| **Input** | Demo script + art direction | Deployed URL + screenshots |
| **Output** | Working prototype | Deck, story, copy, Q&A prep |
| **Skills** | `senior-ai-developer`, `agentic-ui-ux-designer`, `genui`, `claude-api-demo`, `demo-safe` | `creative-ui-ux-director`, `pitch`, `qa-drill`, `senior-product-manager` |

## Sync points — only three

Interrupting a solo coder is expensive. Keep syncs short and scheduled.

| Time | Duration | Agenda |
|---|---|---|
| **11:00** | 5 min | Core path demo. Is the 60-min rule met? (`scope-60`) Art direction handed to KD |
| **12:30** | 10 min | Score against `rubric`. Which dimension is weakest? Reallocate. Drop a WoW if needed |
| **14:00** | 30 min | **Freeze.** Rehearse together. No more building |

Outside these, asynchronous only. HA doesn't interrupt; KD doesn't wait for review.

## Ordering that prevents stalls

**Function first, art direction second.** KD builds the core path 10:15–11:00 with default styling. HA's direction lands at 10:45 and gets applied 11:00–13:00. That way a late mockup never stalls the build.

## Who owns the demo

**HA presents. KD drives.** HA talks; KD operates the laptop and handles anything unexpected. Split so neither is doing two things at once.

Exception: if the judge types (they should — `demo-script-90`), KD hands them the keyboard and HA keeps narrating.

## If someone is blocked

- **KD blocked on a decision** — ask HA, don't wait. Two-minute decisions beat twenty-minute deliberation
- **HA blocked on the build** — work from the last screenshot. Never idle waiting for a deploy
- **Both blocked** — that's a `scope-60` cut-ladder moment
