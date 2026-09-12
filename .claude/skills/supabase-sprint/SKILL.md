---
name: supabase-sprint
description: Fast-path Supabase schema, seeding, and typegen for a hackathon build. Use when setting up data storage or caching municipal data locally. Triggers - "database", "schema", "supabase", "seed data", "store the data", "RLS".
---

# Supabase, fast

Project `mgelmrwklixmhdhfxypk` (us-east-2). Use the Supabase MCP tools — `list_tables`, `apply_migration`, `execute_sql`, `generate_typescript_types`.

## What the database is actually for

**Not** "the app's data model." At this scale it has exactly two jobs:

1. **Cache municipal data** pulled from `halifax-data` so the demo never depends on `services2.arcgis.com` at 15:40 (`demo-safe`)
2. **Store anything the demo generates** that must persist across a page refresh

If neither applies, **skip the database entirely.** A JSON file in the repo is a legitimate answer for a 4-hour build, and it's faster.

## Schema rules

- **Denormalize.** One wide table beats five joined ones. You will not maintain this
- **Text columns over enums.** Enums require migrations to change
- Add `created_at timestamptz default now()` and stop there
- **No auth, no users table** unless the demo shows login — and it shouldn't (`scope-60`)

## RLS

RLS is **on by default** and will silently return zero rows, which costs 20 confused minutes.

For a public read-only demo, make it explicit:

```sql
alter table public.<table> enable row level security;
create policy "public read" on public.<table> for select using (true);
```

Writes from the browser need their own policy. Server-side writes use the service role key and bypass RLS — keep that key server-only (`ship-it`).

## Seeding from HRM

The pattern: fetch once during the build, insert, query locally forever after.

```ts
const url = new URL(`${FEATURE_SERVER}/query`);
url.search = new URLSearchParams({
  where: "1=1", outFields: "*", f: "geojson",
  outSR: "4326", resultRecordCount: "1000",
}).toString();
const fc = await fetch(url).then(r => r.json());
```

Page with `resultOffset` when `exceededTransferLimit` is true. Big layers (`Cityworks_Service_Requests` is 477k rows) — **filter server-side**; don't pull the whole table.

## Types

```
generate_typescript_types  →  src/lib/database.types.ts
```

Regenerate after each migration. Skip it if you're moving fast and using `any` — this is a prototype, not a product.

## Anti-patterns

- Modelling a schema you'll never use
- Migrations for a table you created 10 minutes ago — just `drop` and recreate
- Realtime subscriptions unless the demo visibly shows live updates
- Storing anything you could keep in React state
