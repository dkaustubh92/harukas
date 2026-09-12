# 03 · Which Tree Falls First — research

**Verified live against HRM open data, 12 Sep 2026 ~10:15. Verdict: PURSUE.**

**Follow-up, ~11:31 ADT:** The [source review](03-trees-data-sources.md) verifies
diameter-band labels and corrects the earlier confidence claim about asset matching.
The distances below demonstrate nearby coverage, not confirmed tree identity.

## The trap that kills the obvious build

`DESCRIPTION` on Cityworks Service Requests is **a 101-value pick list, not free text.**
Every tree request literally reads `"Trees"`. The `Cityworks_Service_Requests_Custom_Fields`
table (1.15M rows) is operational metadata — snow routes, contractors, dispatch
confirmations — not resident narrative.

**There is no complaint text in the public data.** Any team that picks this planning to
"have Claude read the complaint and rank it" is dead around 11:30. We know at 10:15.

## Verified numbers

| Fact | Value | Query |
|---|---|---|
| Tree requests, all time | **34,860** | `DESCRIPTION='Trees'` |
| **Open right now** | **292** | `+ STATUS='OPEN'` (slide said 290 — this is live) |
| With usable coordinates | **278** (95%) | `+ LATITUDE IS NOT NULL` |
| Oldest still open | **432 days** (#2548398, Cole Harbour, P4) | `orderByFields=DATE_INITIATED ASC` |
| Public tree inventory | **80,051** trees | `Public_Trees/FeatureServer/0` |

**Priority split on the 292 open requests:**

| P1 | P2 | P3 | P4 |
|---|---|---|---|
| 0 | 3 | 36 | **253** |

**87% of the open queue sits at the lowest priority.** The slide's claim — *"dangerous or
cosmetic, same queue"* — is not rhetoric, it is a fact we can show live. The priority field
exists and is effectively unused.

## The insight (not on the slide)

The slide identifies site visits as the bottleneck. Inventory records can supply
context for deciding which request to inspect first. They do not replace an on-site
assessment.

`Public_Trees` carries, per tree: **scientific + common species, DBH (diameter at breast
height), `WIRES` (wires present), year planted, general location, maintained-by, condition
expiry date.** 80,051 of them.

The proposed enrichment matches request coordinates to nearby inventory candidates.
That supplies recorded species, diameter band, and wires context before a visit.
The request coordinates may be approximate, so the nearest asset is not necessarily
the reported tree. Show that uncertainty with the recommendation.

## Endpoints

```
https://services2.arcgis.com/11XBiaBYA9Ep0yNJ/arcgis/rest/services/Cityworks_Service_Requests/FeatureServer/0
https://services2.arcgis.com/11XBiaBYA9Ep0yNJ/arcgis/rest/services/Public_Trees/FeatureServer/0
```
No auth, CORS open. **Seed both — do not query live on the demo path** (`demo-safe`).

## The Monday person

**HRM urban forestry dispatch.** Monday morning: 292 open tickets, 253 of them flagged
identically, one of them 432 days old, no way to know which to drive to first. We hand back
the same list, ordered, with the reason for each position. Nothing to adopt, nothing to
integrate — it is their existing queue, sorted.

## Nearby inventory coverage (tested on 30 oldest open requests)

| | |
|---|---|
| Matched to a tree within 60 m | **29 / 30** |
| Median distance | **18.9 m** |
| Within 30 m | 26 / 30 |
| Within 15 m | 9 / 30 |

The one miss was in Hammonds Plains. No nearby inventory record was found within
the search radius. Show **No asset match**. This does not establish tree ownership.

**Two gotchas found while proving it — both would have cost an hour mid-build:**

1. **Geometry comes back projected, not lat/lon.** Pass `outSR=4326` on the spatial query or
   your distances come out in the millions. The server-side `distance=60&units=esriSRUnit_Meter`
   filter is correct regardless; it's only the returned geometry that misleads
2. **`DBH` is a coded diameter band, not a direct measurement**, despite `SIZE2UNIT`
   reading `CM`. The follow-up schema check found labels for codes 1 through 9:
   code 4 means 31 to 45.9 cm. A grouped query found one unlabeled code 11 and 576
   nulls. Use published bands, preserve unknown codes, and never render "a 4 cm tree"

## Risks

| Risk | Mitigation |
|---|---|
| **Do not claim safety diagnosis.** "This tree is safe" from a photo or a record is indefensible and a judge will push on it | Frame strictly as **triage order** — which to look at first — never a safety verdict. This is also the honest Q&A answer |
| Nearest-tree join may mismatch | **Open**. Nearby coverage was 29/30 at median 18.9 m. Show distance and require confirmation before treating a candidate as the reported tree |
| `DBH` is a class code, not a measurement | Render its published diameter band. Null or unmapped codes remain unknown. Do not display raw codes as centimetres or a scale of 11 classes |
| Risk score must be defensible, not vibes | Build it from DBH + wires present + species + age + days waiting, and **show the inputs** next to the score |
