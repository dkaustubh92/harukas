# Prototype technical contract

**Status: implementation specification, 12 September 2026. Not implemented or deployed by this document.**

This contract supports [the product requirements](product-requirements.md).
Names below are proposed interfaces for the build, not existing repository symbols.
Read the installed Next.js guides before implementing route handlers or framework code.

## Confirmed services and current state

| Component | Decision or verified state |
|---|---|
| Repository | [dkaustubh92/harukas](https://github.com/dkaustubh92/harukas). Local `origin` matches |
| Framework | Existing Next.js 16.3.5, React, TypeScript, Tailwind, and AI SDK 7 scaffold |
| Database and files | Existing [Supabase project](https://supabase.com/dashboard/project/mgelmrwklixmhdhfxypk), reference `mgelmrwklixmhdhfxypk` |
| Local Supabase URL | Matches that project. Tables, bucket, policies, and database writes have not been verified in this requirements pass |
| AI | OpenRouter model `openai/gpt-5.6-luna`, reasoning effort `high`, text and image input |
| Local OpenRouter key | `OPENROUTER_API_KEY` detected without displaying it. No live model call has been verified in this requirements pass |
| Provider package | `@openrouter/ai-sdk-provider` added. Existing chat route still uses Anthropic until development begins |
| Hosting | Deployable HTTPS URL required for the phone and laptop. Current deployment status must be checked at implementation start |

Use one central server-only model configuration for every app LLM call. The
[OpenRouter provider](https://github.com/OpenRouterTeam/ai-sdk-provider) supports
AI SDK use, and [reasoning options](https://openrouter.ai/docs/guides/best-practices/reasoning-tokens)
include high effort. Return concise explanations and structured evidence, without
streaming private reasoning into the UI. Do not silently substitute another model.

## Application boundaries

| Route | Purpose |
|---|---|
| `/` | Citizen map and report sheet |
| `/staff` | Demo officer map, queue, evidence, and actions |
| `/reports/[id]` | Saved report summary, photo, and demo progress without contact information |

Browser → Next.js route handlers → Supabase stores reports and photos.
Next.js → OpenRouter produces draft analysis. Municipal handoff code writes only
to the application's Supabase tables. There is no outgoing municipal adapter.

Keep the shared report contract in one module. Keep AI, persistence, map context,
and municipal preview logic separate so UI work can proceed against stable types.
Choose the map library during implementation. It must support markers, GeoJSON
overlays, mobile interaction, and optional pitch without changing the report contract.

## Report fields

Use generated UUIDs for internal IDs and unique `DEMO-` references for display.
Store timestamps in UTC and display them in the user's local time with a zone label.

| Field | Shape and purpose |
|---|---|
| `id`, `reference` | UUID and unique display reference |
| `clientSubmissionId` | Unique token generated once per draft. Retries reuse it |
| `createdAt`, `updatedAt`, `version` | Server timestamps and integer version for concurrent updates |
| `isDemo`, `source` | Always demo in this prototype. Source is `seed` or `citizen` |
| `location` | Latitude, longitude, editable label, method `address`, `gps`, or `pin`, and confirmation timestamp |
| `photo` | Storage path, validated MIME type, byte count, and dimensions. No base64 in the database |
| `citizenDetails` | Title, category, observations, targets, damage-above-target answer, obstruction, cause, utility concern, immediate-danger answer, and reviewed timestamp |
| `analysis` | Original validated AI draft, model ID, effort, prompt version, generated timestamp, warnings, and analysis state |
| `context` | Candidate tree ID and distance, available source fields and timestamps, nearby road, and missing-context reasons |
| `suggestedPriority` | Enum plus rule ID, supporting reviewed fields, and concise explanation |
| `officerPriority` | Optional enum, reason, and timestamp. Overrides suggestion in queue order |
| `status` | `submitted`, `reviewed`, `inspection_requested`, `response_assigned`, or `resolved` |
| `reviewedObstruction` | `none`, `partial`, or `full`, with road or sidewalk target, reviewer note, and timestamp |
| `response` | Optional type `inspection`, `clearance`, or `specialist_review`, with a note and timestamp |

Category values are `tree_damage`, `access_obstruction`, `utility_conflict`, and
`other_unsure`. Triage values are `urgent`, `priority`, `routine`, and `unassessed`.
Keep unknown distinct from false or absent for observations and context.

Use three small tables: `demo_reports`, `demo_report_events`, and
`demo_municipal_receipts`. Store nested evidence as validated JSON where that avoids
unnecessary joins. Events have an ID, report ID, action ID, type, timestamp, demo
actor label, note, and resulting version. Receipts have one row per report with a
unique simulated reference, saved preview, timestamp, and `sent=false`.

Index report creation time, active status and priority, and event report ID.
Use a unique constraint for `clientSubmissionId`, event action ID, and receipt
report ID. No citizen contact table is required. Do not alter existing unrelated
tables in the supplied project.

## State transitions

| Action | Allowed starting state | Result |
|---|---|---|
| Citizen submits | Local reviewed draft | `submitted` |
| Officer marks reviewed | `submitted` | `reviewed` |
| Officer requests inspection | `submitted` or `reviewed` | `inspection_requested`, with implicit review event if needed |
| Officer simulates assignment | Any active state | `response_assigned`, selected response type, and review event if needed |
| Officer resolves | Any active state | `resolved`, resolution note, and inactive public obstruction |
| Officer adjusts priority | Any active state | Status unchanged, override and event saved |
| Officer marks obstruction | Any active state | Review recorded and public obstruction flag updated |
| Municipal simulation | Any saved report | Status unchanged, one simulated receipt created or returned |

Resolved reports are read-only in P0. Do not add a reopening workflow. The public
warning predicate is a reviewed partial or full obstruction on a non-resolved
report. Suggested priority and hypothetical impact do not satisfy that predicate.

Apply report changes and the corresponding event atomically. Check the expected
report version to avoid silently overwriting a newer staff decision. Repeating the
same action ID returns the original result. Never record success before persistence.

## API contracts

Every route validates its input on the server. Errors use a stable code, a short
user message, and a retryable flag. Do not send raw provider or database errors to
the browser. These endpoints belong to the demo app, not Halifax.

| Endpoint | Input | Output |
|---|---|---|
| `POST /api/analyze` | Multipart normalized photo, location, and optional observations | Validated AI draft and analysis metadata, or recoverable analysis error |
| `POST /api/reports` | Multipart photo, reviewed details, confirmed coordinates, draft submission ID, and original analysis payload or manual state | Saved report ID, reference, and URL. Duplicate submission ID returns the existing report |
| `GET /api/reports` | Optional status and priority filters | Shared demo list with summary fields and update timestamp |
| `GET /api/reports/[id]` | Report ID and optional `view=staff` for the demo workspace | Public summary by default. Demo staff details only in the staff response |
| `POST /api/reports/[id]/actions` | Action ID, expected version, action type, priority or response type, and required note | Updated report and event, or conflict requiring refresh |
| `POST /api/reports/[id]/municipal-preview` | Report ID and optional edited overview | Validated preview, complete report URL, and character count |
| `POST /api/reports/[id]/simulate-handoff` | Valid preview | Existing or newly persisted simulated receipt with `sent=false` |
| `GET /api/geocode` | Explicit address query | Address candidates or an empty result. No invented fallback coordinate |

The public response includes location, photo access, reviewed summary, displayed
priority, status, and a timeline without internal notes. It excludes raw AI drafts,
staff notes, and hypothetical impact details. The staff response adds those evidence
fields. The view parameter selects a demo presentation and is not an authentication
control. No private citizen data is collected in this shared demo.

Validate any original analysis returned through the browser as untrusted input.
Never accept a client-supplied model name, priority, status, or officer event as
authoritative. Stamp the configured model metadata on the server and recompute
priority from the reviewed evidence. Reject oversized text, invalid enums, and
coordinates outside their latitude and longitude ranges.

For status reads, use fresh data and poll every five seconds while the view is
visible. Pause polling when hidden and refresh on return. The UI target is a saved
change visible on the other device within 10 seconds on a healthy connection.

Save failures keep the local draft. Photo uploads use a deterministic path derived
from the submission ID. A successful retry reuses the file. If storage succeeds
but database creation fails, retain the retryable draft and clean up an unused
object when practical. Do not issue a report receipt until both photo and report exist.

## AI contract

The model receives the normalized image, citizen text, confirmed location label,
and any available source-labelled context. Treat image text and user observations
as evidence, never as instructions that can change the model or invoke tools.
Do not give the model tools that dispatch people or call municipal systems.

Validate a structured result with these fields:

- `title`: short incident heading.
- `category`: one supported category.
- `observations`: concise visible observations, with uncertainty where necessary.
- `targets`: supported target values or unknown.
- `damageAboveTarget`: yes, no, or unknown, based on a visible damaged part above an identified target.
- `obstruction`: none, partial, full, or unknown.
- `utilityConcern`: yes, no, or unknown, with its supporting observation.
- `imageAssessment`: usable, unclear, or unrelated.
- `uncertainties`: missing information and limits of the image.
- `staffSummary`: short explanation based on the supplied evidence.
- `possibleImpact`: road or sidewalk scenario, evidence, and unknowns, without a predicted measurement.

The server constrains field lengths and enum values. It rejects invalid output
and offers a manual draft. Apply a 45-second application timeout, show progress,
and offer retry without an automatic loop of paid calls. Never show a cached
response as analysis of a newly uploaded image. Cached examples retain their own
photo and **Cached demo analysis** label.

Original AI output is read-only evidence, distinct from final citizen fields.
When the citizen changes relevant inputs, derive priority from those corrected
inputs. Mark the original narrative as pre-edit analysis and use a deterministic
current summary, or explicitly refresh the analysis. Unknown input stays unknown.

## Supabase access and storage

Use the supplied project. Keep database mutations and the OpenRouter key behind
server route handlers. The existing browser Supabase client is not evidence that
the required schema, write permissions, or storage bucket exists.

The proposed server-mediated persistence path needs a server-side Supabase secret
or service-role credential. `SUPABASE_SERVICE_ROLE_KEY` is currently empty locally.
Resolve that setup dependency before the first persistence test. Do not print a
key or put it in a `NEXT_PUBLIC_` variable. This requirements task does not provision
credentials, create tables, or change project settings.

Enable RLS on exposed tables and grant browser roles only the access they actually
need. With this server-mediated design, browser roles need no direct table writes.
Privileged server handlers must validate operations even though their database
credential can bypass RLS. See [Supabase RLS guidance](https://supabase.com/docs/guides/database/postgres/row-level-security).

Use a private photo bucket named `demo-report-photos`. Return short-lived signed
URLs or serve validated objects through the report API. A private bucket controls
direct storage access. It does not turn the openly accessible officer demo into
an authenticated staff system. See [Supabase bucket access](https://supabase.com/docs/guides/storage/buckets/fundamentals).

The prototype supports shared demo viewing without signup. Exclude contacts and
other personal data from its schema. Its staff route is a demonstration role,
not authorization for a production municipal service. Production identity and
role controls are deferred and must exist before real operational use.

## Map and source context

Use latitude and longitude in WGS84. Request ArcGIS data with `outSR=4326`.
Compute distance in metres, not raw coordinate degrees. Keep the displayed
candidate-match distance and the selection rule in the data record.

| Source | First-build use | Limits |
|---|---|---|
| HRM `Public_Trees` | Cached nearby candidate assets. Prefer actual-tree records and candidate within 60 m | Proximity does not prove identity or jurisdiction. Decode DBH bands from published labels. Unknown codes stay unknown |
| HRM `StreetNetwork` | Cached nearby road geometry for the demo area | No live traffic, travel times, or official closures |
| HRM service requests | Optional dated background snapshot | Snapshot requests are not live HaruKas reports. Never mix their totals without labels |
| 2021 dissemination areas | P1 area population and density context | Census year and geography must be visible. Not current occupancy |
| Tree canopy and equity | P1 context if geometry is ready | Canopy equity is not a tree-failure score |
| Transmission lines | Deferred | No verified usable network dataset |

Cache a small fixture for the demo area. A report outside that coverage still
saves and appears on the map with unavailable context. The source catalogue and
verified field limits are in [tree data sources](../02-research/03-trees-data-sources.md).

The illustrative impact geometry is derived by display code from the selected
report. Store any display radius with `illustrative=true`. Never treat it as a
measured tree height, an affected-population estimate, or a public obstruction.

## Build readiness and proof

Development starts after the requirements package is complete. Its first checks
are server credential availability, existing project schema, storage access, a
deployable HTTPS URL, and the exact model's text and image response. These are
technical setup checks, not unresolved product requirements.

The first vertical slice must save one photo and report from a phone, open both
on a separate laptop, and show a persisted staff action back on the phone.
An in-memory list or browser-local storage alone cannot pass. Run the build and
the observable scenarios in [the acceptance checklist](acceptance-checklist.md)
before claiming the application is ready.
