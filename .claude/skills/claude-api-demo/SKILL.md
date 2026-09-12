---
name: claude-api-demo
description: Claude API settings tuned for a live judged demo - latency, cost against limited credits, and model routing. Use when wiring Anthropic calls or when the demo feels slow. Triggers - "claude api", "anthropic sdk", "it's too slow", "which model", "prompt caching", "fast mode", "api cost".
---

# Claude API for a live demo

Constraints: **$100 of credits**, a judge watching, and conference wifi. Load the full `claude-api` skill for SDK specifics — this covers only demo-tuning.

## Model routing (project decision)

| Context | Model | Why |
|---|---|---|
| **The prototype** | `claude-opus-5` | Half the cost, no tool-choice restriction, predictable turns |
| **Claude Code sessions** — ideation, planning, creative | `claude-fable-5-1` | Most capable; latency doesn't matter there |
| **Claude Code sessions** — coding | `claude-opus-5` at `xhigh` | Claude Code's own default for agentic coding |

| Model | Input /1M | Output /1M |
|---|---|---|
| `claude-fable-5-1` | $10.00 | $50.00 |
| `claude-opus-5` | $5.00 | $25.00 |

**Keep Fable 5.1 out of the request path.** Three reasons: forced tool use returns a **400** (breaks generative UI), single requests can run **many minutes**, and it's **2× the cost** against limited credits.

## Latency levers, in order

1. **Stream.** Non-negotiable. Perceived latency is what the judge experiences
2. **Lower the effort.** `output_config: {effort: "low"}` or `"medium"` on the hot path. Default is `high`; lower effort on Opus 5 often beats prior-generation models at high effort
3. **Fast Mode** — up to 2.5× output tokens/sec:
   ```ts
   client.beta.messages.stream({
     model: "claude-opus-5", max_tokens: 4096,
     speed: "fast", betas: ["fast-mode-2026-02-01"],
     messages: [...],
   })
   ```
   Opus 5 / Opus 4.8 only, Claude API only. Priced at $10/$50 — you're buying speed, not depth
4. **Prompt caching** on the stable prefix. Order is `tools` → `system` → `messages`; keep volatile content last. Verify with `usage.cache_read_input_tokens` — if it's 0 across repeated calls, something is silently invalidating it (a timestamp in the system prompt is the usual culprit)
5. **Smaller `max_tokens`** on the demo path. You're not writing an essay

**Caches are model-scoped** — mixing models forfeits reuse. Another reason to stay on one model.

## Current-API gotchas

- **`budget_tokens` is removed** on Opus 5 / Fable 5 / 5.1 / Sonnet 5 — returns 400. Use `thinking: {type: "adaptive"}` and control depth with `effort`
- **Thinking is on by default on Opus 5** and `display` defaults to `"omitted"` — so streaming looks like a long pause before output. Set `display: "summarized"` if you're showing reasoning
- **No assistant prefill** — 400 on all current models. Use structured outputs instead
- **Model IDs take no date suffix** — `claude-opus-5`, never `claude-opus-5-20260401`
- **Parse tool inputs with `JSON.parse()`**, never string-match the serialized input
- **Check `stop_reason` before reading content** — `"refusal"` returns HTTP 200

## Cost control

$100 goes further than it feels, but a runaway agent loop can eat it in minutes.

- Cap loop iterations. An unbounded agent in a demo is both a cost and a latency risk
- Cache aggressively — cache reads are a fraction of input price
- Track `response.usage` during the build so 14:00 holds no surprises
- **Cache the demo-path responses themselves** before demoing (`demo-safe`)
