# Webapp execution plan

**Requirements first. Development starts after the specification is complete.**
The user confirmed a hard ready deadline of **14:00 ADT on 12 September 2026**.
The original request for 90 minutes of building plus 60 minutes of improvement no
longer fits. Target the complete working path within 75 minutes of implementation
start, with a checkpoint no later than **13:40**. Reserve **13:45–14:00** for final
verification and rehearsal. If work starts later, reduce optional work rather
than move the deadline.

Use [product requirements](product-requirements.md),
[technical contract](technical-contract.md), and
[acceptance tests](acceptance-checklist.md) as the build specification.

## First deliverable

On a phone, select a photo and confirm a tree location. Review Luna's suggested
details and submit. On a separate laptop, open the same saved photo and report,
review priority and possible impact, and simulate a response. See that response
on the phone. Open a municipal overview with the report link and simulate its
receipt. No government request, real dispatch, or external notification occurs.

## Build order

Elapsed times begin at the actual implementation start. The absolute checkpoints
above always take precedence. Integrate at every stage instead of waiting for
independent screens to be finished.

| Elapsed target | Deliverable | Observable completion |
|---|---|---|
| 0–15 min | Confirm server credentials, schema and photo storage. Establish HTTPS deployment and report contract | One manually entered demo report and photo survive refresh and open on both devices |
| 15–35 min | Citizen map, location input, normalized image upload, Luna draft, review and save | Actual image produces editable fields. Manual fallback also saves |
| 35–55 min | Officer map, queue, evidence, deterministic priority, and human actions | New report appears and an officer action persists to the citizen view |
| 55–70 min | Reviewed obstruction marker, staff-only illustrative impact, municipal preview and receipt | The public marker requires review. Preview has a working report URL and at most 500 characters |
| 70–75 min | Integrate and test complete path on both devices | Critical flow works without browser-local-only data, duplicate saves, or false success |
| Remaining time before 13:45 | Fix failures, refine layout, optionally add tilted map or 3D | P0 stays working on both actual devices |
| 13:45–14:00 | Run final acceptance checks, rehearse, prepare cached fallback | Deployed URL, devices, image fixture, and three-minute narrative are ready |

## Ownership and parallel work

KD or the integrating agent owns the schema, shared types, API contracts, integration,
and deployment. Define those interfaces before splitting UI implementation.
Luna max subagents may own a citizen UI, officer UI, or independent verification
task with separate files. The app itself uses Luna with **high** effort through
OpenRouter. Agent settings do not change the app model configuration.

HA reviews the deployed mobile and laptop views and owns the spoken narrative.
Each contributor reports an integration blocker promptly. Avoid simultaneous edits
to shared types, global styles, package files, or the same route.

The separate seed-data task owns `lib/demo-incidents.ts` and
`public/demo-incidents/` for 25 fictional existing reports. Integrate its export
after checking the contract. Do not duplicate that work. The user accepts a 2D
or 2.5D map, so start with that and protect the complete reporting flow.

## First setup checks

- Verify the supplied Supabase project's existing schema and bucket before adding
  isolated demo tables. Obtain the server credential needed by the chosen access
  path. The local service-role value is currently absent.
- Verify the deployable HTTPS URL and deployment environment variables. A local
  `.env.local` does not configure hosting.
- Verify `openai/gpt-5.6-luna` at high effort with actual text and image input.
- Prove a photo and report round trip between separate browsers before styling.

These checks are planned development work. They have not been performed by the
requirements pass. Do not replace shared persistence with local storage and call
the two-device requirement complete.

## Cut order

Cut these improvements in order when the clock tightens:

1. Animations and decorative transitions.
2. Tilted map and 3D buildings. Retain the interactive 2D map.
3. Census and canopy overlays, full-city context, and imported municipal backlog.
4. Extra filters, presentation metrics, and additional seeded scenarios.

Preserve one photo, confirmed location, manual model fallback, citizen review,
shared persistence, officer decision, public obstruction review, illustrative
impact, and simulated municipal preview. Show missing context explicitly instead
of inventing data. If any required link remains broken, report that limitation
instead of marking the build ready.

## Failure and rehearsal plan

Keep a labelled seeded report with a suitable photo, cached example analysis, and
known location. Use it when the model or external map context is unavailable, and
say that the example is cached. A new photo still follows the manual draft path
when analysis fails. A storage outage must show failure, never a fake saved receipt.

Rehearse [the three-minute demo](demo-script.md) on the actual phone, laptop, and
venue network. Keep the report link and QR accessible. Reset only the demonstration
fixtures created for rehearsal, never unrelated Supabase data. Run the build and
the acceptance scenarios before declaring the deployed app ready.
