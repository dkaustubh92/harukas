# HaruKas

> Built at the **Claude Hackathon Halifax**, 12 September 2026, at Volta.

<!-- TODO post-demo: one-sentence description of what this actually does -->

## What it does

<!-- TODO: the impact sentence from the pitch. Who hurts, what changes. -->

## Built with

- **Next.js** (App Router) + TypeScript
- **Claude** (`claude-opus-5`) via the Anthropic API and the Vercel AI SDK
- **Supabase** — Postgres
- **Vercel** — hosting
- **Halifax Regional Municipality Open Data** — see attribution below

## Running locally

```bash
npm install
cp .env.example .env.local   # fill in your own keys
npm run dev
```

Required environment variables:

| Variable | Notes |
|---|---|
| `ANTHROPIC_API_KEY` | **Server-only.** Never expose to the client |
| `NEXT_PUBLIC_SUPABASE_URL` | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | **Server-only** |

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
