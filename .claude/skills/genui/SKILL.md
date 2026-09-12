---
name: genui
description: Implementation reference for generative UI - having Claude drive real React components instead of returning prose. Use when wiring model output to rendered UI. Triggers - "generative UI", "render components from the model", "streamUI", "tool results as UI", "AI SDK", "AG-UI".
---

# Generative UI

The model chooses and populates **your** components. Output is UI, not a paragraph describing UI.

> **Verify exact signatures against current docs before writing** (`ai-sdk.dev/docs`). APIs in this space moved fast through 2026 — the patterns below are stable, the call shapes may not be.

## The three approaches

| Approach | How it works | Use when |
|---|---|---|
| **Model selects your components** (Vercel AI SDK, CopilotKit, Tambo) | You define components + tool schemas; tool results render as React | **Default choice.** Type-safe, you control the design |
| **Model authors UI as data** (A2UI, json-render) | Agent emits structured JSON describing UI; a renderer interprets it | Maximum flexibility, no two screens alike |
| **Transport layer** (AG-UI) | Standardized agent→frontend event stream | When you want a documented event protocol |

For a 4-hour build on Next.js + Vercel, **approach 1 with the Vercel AI SDK** is the right default — it's native to the stack and you'll fight it least.

## The pattern

1. Define a small set of components the model can render — `<ServiceRequestMap>`, `<TrendChart>`, `<StatCard>`
2. Expose each as a tool whose schema is that component's props
3. Model calls the tool; the tool result renders as the component, streamed
4. UI assembles itself as the agent works

The demo moment is **watching the page build itself** in response to the judge's question.

## AG-UI event model

Useful vocabulary even if you don't adopt the protocol — these are the states your UI must represent:

`RunStarted` · `RunFinished` · `RunError` · `TextMessageStart` / `Content` / `End` · `ToolCallStart` / `Args` / `End`

Map each to something visible (`agentic-ui-ux-designer`). `ToolCallStart` in particular is where "Querying 477,000 service requests…" belongs.

## Critical: model compatibility

**Use `claude-opus-5`, not `claude-fable-5-1`.**

The common way to guarantee a component render is forcing a tool call. On Fable 5.1, `tool_choice: {type:"any"}` and `{type:"tool", name:...}` **return a 400**. Opus 5 has no such restriction.

If you must force structure, the alternatives are `tool_choice: auto` plus an explicit instruction, `strict: true` on the tool, or structured outputs via `output_config.format`.

## Scope warning

Generative UI is a strong visual WoW but it is **not a 60-minute build**. Get the core path working with fixed components first (`scope-60`), then convert to generative during the 11:00–13:00 window. A half-built generative layer at 13:30 is worse than three excellent fixed components.
