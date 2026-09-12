---
name: agentic-ui-ux-designer
description: Interaction design for agentic apps - surfacing what the agent is doing rather than hiding it behind a spinner. Use when building any UI where Claude does multi-step work. Triggers - "agentic UI", "show the agent working", "loading state", "streaming UI", "how should this feel", "it looks like a chatbot".
---

# Agentic-era interaction design

The defining move of agentic UI: **the interface shows the work, it doesn't hide it.** A spinner wastes the most interesting thing your product does.

## The core inversion

| Conventional app | Agentic app |
|---|---|
| Spinner, then result | The work is the content |
| User clicks through steps | User states intent; agent plans |
| Chat box bolted onto an app | The chat dissolves *into* the app |
| Progress bar (fake) | Real steps, named as they happen |

If your UI is a message list with a text box, you're building a chatbot — which caps the technical score (`senior-ai-developer`).

## Patterns worth building

**Inline tool-call visibility.** Show each tool as it fires: *"Querying 477,000 service requests…"* → *"Found 1,240 in your area."* This is the single highest-value pattern — it converts dead latency into the most impressive part of the demo.

**Progress for long-running work.** Named steps that complete visibly. Never a bar that fills at a fictional rate.

**Shared state display.** A persistent panel showing what the agent knows and has decided. Makes the agent feel like a colleague rather than a black box.

**Plan-then-execute.** Agent proposes steps; user can watch or intervene. Even if intervention is never used in the demo, *showing* the plan reads as sophisticated.

**Generative surfaces.** Agent output becomes real components — a map, a chart, a table — not a paragraph describing one. See `genui`.

**Interruptibility.** A visible stop control. Rarely used, always reassuring.

## Latency is a design material

Every agent interaction has dead time. You either fill it or lose the room.

- **Stream everything.** Perceived latency is what counts
- **Say what's happening** in specific terms — "Cross-referencing deprivation quintiles" beats "Thinking…"
- **First paint under 1 second.** Something must change on screen immediately after the judge hits enter
- **Reveal progressively** — partial results as they arrive, never a held-back final answer

## Hard rules

- **No bare spinners.** Ever. If you have a spinner, you've thrown away your best demo material
- **No blank screens.** Every state has content, including first-load and error
- **Never hide the interesting part.** If the agent does something clever, it is on screen
- **No fake progress.** Judges notice, and it undermines everything else

## Demo check

Watch the 90 seconds with sound off. **Can you tell the agent is doing something sophisticated?** If not, the work is invisible and scores nothing.
