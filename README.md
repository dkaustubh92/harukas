# HaruKas

> Built at the **Claude Hackathon Halifax**, 12 September 2026, at Volta.

## What it does

HaruKas is a hackathon prototype that starts with a resident's photo and confirmed tree location, then carries the report to an officer's response decision. The citizen opens the mobile browser, reviews Luna's editable draft, and follows the shared demo status on the phone. The officer sees the same report on a laptop, reviews its evidence and uncertainty, and records a simulated response. The current repository still contains the generic Next.js chat scaffold; the tree-report and queue flows are not implemented in this snapshot.

## Requirements

Complete and review the [product requirements](docs/03-requirements/product-requirements.md), [technical contract](docs/03-requirements/technical-contract.md), [acceptance checklist](docs/03-requirements/acceptance-checklist.md), and [execution plan](docs/03-requirements/execution-plan.md) before development. These documents are canonical. Older `scope.md` provides historical context. `demo-script.md` is a rehearsal aid subordinate to the canonical requirements.

## Built with

- **Next.js** (App Router) + TypeScript
- **OpenRouter** (`openai/gpt-5.6-luna`, high reasoning effort) via the Vercel AI SDK; the model accepts text and image input
- **Supabase** — Postgres
- **Vercel** — hosting
- **Halifax Regional Municipality Open Data** — see attribution below

## Running locally

```bash
npm install
npm run dev
```

Create or edit `.env.local` without overwriting an existing file. Add the required variables below before running `npm run dev`. `@next/env` detects `OPENROUTER_API_KEY` in the current local setup. Keep the value server-only and out of the repository.

The Supabase project is `mgelmrwklixmhdhfxypk`, and the local `NEXT_PUBLIC_SUPABASE_URL` matches that project. The GitHub repository is [`dkaustubh92/harukas`](https://github.com/dkaustubh92/harukas). `SUPABASE_SERVICE_ROLE_KEY` is absent and remains a setup dependency for any backend write. No backend write has been tested.

Required environment variables:

| Variable | Notes |
|---|---|
| `OPENROUTER_API_KEY` | **Server-only.** Used for all app LLM processing; never expose to the client |
| `NEXT_PUBLIC_SUPABASE_URL` | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only.** Absent in the current setup; required before adding backend writes |

## Prototype boundary

The prototype simulates the municipal handoff inside HaruKas. It never creates a real municipal request, uploads or sends a report to Halifax or Nova Scotia Power, dispatches a crew, or sends a notification. Every receipt is simulated.

## Data attribution

Contains information licensed under the
[Halifax Regional Municipality Open Data Licence](https://data-hrm.hub.arcgis.com/pages/open-data-licence).
Data © Halifax Regional Municipality.

Halifax open data is not affiliated with, and does not endorse, this project.

## Team

- **KD** — engineering, product
- **HA** — design, narrative

## Licence

[MIT](LICENSE). Contributions welcome — this was built for Halifax, and the
municipality or anyone else is free to fork, adapt, or ship it.
