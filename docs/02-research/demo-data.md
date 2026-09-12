# Demo data ready for integration

**Collected and checked: 12 September 2026.** This is local fixture preparation.
No reports have been inserted into Supabase or sent to a municipal system by this task.

## Fictional report set

The [fixture module](../../lib/demo-incidents.ts) exports `DEMO_INCIDENTS`,
`createDemoIncidents()`, and `DEMO_INCIDENT_DATASET`. Use the copy function when
initializing an empty demo store. Do not overwrite later citizen reports or
officer decisions when a page refreshes.

The [raw dataset](../../data/demo-incidents.json) contains 25 fictional reports:

| Dimension | Counts |
|---|---|
| Priority | 6 urgent, 9 priority, 6 routine, 4 needs assessment |
| Workflow | 8 submitted, 5 reviewed, 5 inspection requested, 4 response assigned, 3 resolved |
| Active reviewed obstructions | 4 |
| Photos | 5 representative photographs, reused with one photo per report |

Each report has a stable UUID, a `DEMO-` reference, explicit unknowns, and an
approximate location placed on real HRM road geometry. These positions do not
identify actual incidents. The source-backed road labels replace unverifiable
cross-street descriptions from the first draft.

The photo manifest carries author, source page, licence, and a statement that the
image was taken elsewhere. Keep that statement and the
[photo credits](../../public/demo-incidents/ATTRIBUTION.html) visible when displaying
the photos. All five local JPEGs were inspected and are below 2 MB each. Authored
scenario analysis has `state='seeded'` and null live-model metadata. It must not
appear as a newly generated Luna result.

## Real geographic context

The [context cache](../../public/demo-context/README.md) contains:

- 1,855 in-service HRM tree inventory points near the final demo locations.
- 1,063 road segments on the roads selected for the demo.
- 18 nearby candidate tree joins within 60 metres and 7 explicit no-match results.

These are geographic observations from HRM's public tree and street layers. They
are separate from fictional report evidence. A nearby real asset is not a verified
damaged tree or a confirmed incident match. Display published DBH band labels and
retain unknowns. Do not infer electrical networks, property jurisdiction, or
current road closures from the cache.

The [manifest](../../public/demo-context/manifest.json) records source URLs,
collection time, query bounds, field domains, and the raw fixture's SHA-256 hash.
The cache occupies about 2.3 MB before transfer compression. Load cached data
instead of querying HRM during the demo.

## Verification and integration boundary

Checks covered report count, unique IDs and coordinates, timestamp order, priority
inputs, reviewed public warnings, photo references and sizes, geographic coordinate
ranges, tree status, diameter labels, source IDs, and candidate distances.

Recheck the geographic cache after changing fixtures:

```sh
python3 scripts/validate-demo-context.py
```

The application can join `report-context.json` to reports by `reportId`, then read
candidate geometry and inventory fields from `trees.geojson`. Preserve the
**Candidate only** label and collection timestamp. A new report outside the cache
can still save with unavailable context.

The fixture module is ready for an application adapter. Shared Supabase persistence,
live Luna image analysis, citizen UI, officer UI, and municipal simulation remain
separate implementation work. Real municipal submissions remain prohibited.
