---
name: halifax-data
description: Find and query real Halifax (HRM) municipal open data. Use when the task needs actual Halifax civic data — transit, flooding, zoning, housing, snow clearing, parks, traffic, demographics — or when someone asks "is there data for X in Halifax", "what datasets exist", or needs a live GeoJSON endpoint to build against. Returns verified FeatureServer URLs and working query snippets, not guesses.
---

# Halifax Open Data

**339 publicly queryable layers**, probed one by one on 11 Sept 2026. Only 4 need a token (all flood extents).

## The three facts that matter

1. **Org ID is `11XBiaBYA9Ep0yNJ`** on `services2.arcgis.com`
2. **No auth required.** No API key, no token, no signup.
3. **`access-control-allow-origin: *`** — query it **directly from the browser**. Do not build a proxy route. This is the single biggest time-saver.

**Do not trust the DCAT feed** (`/api/feed/dcat-us/1.1.json`). 76 of its entries point `accessURL` at an HTML download page instead of a FeatureServer, and it omits services that are actually live. `catalog.json` here is built from the services directory and every entry was probed.

## Find a dataset

`catalog.json` (bundled here) has every dataset: `title`, `desc`, `keywords`, `featureserver`, `geojson`, `modified`.

```bash
# search by keyword
python3 .claude/skills/halifax-data/scripts/find.py flood
python3 .claude/skills/halifax-data/scripts/find.py "winter sidewalk"
```

Never guess a URL. Look it up in `catalog.json`.

## Query live data

Every `featureserver` URL takes `/query`:

```
<featureserver>/query?where=1%3D1&outFields=*&f=geojson&resultRecordCount=50
```

From the browser — this is the pattern to reach for:

```ts
const url = new URL(`${FEATURE_SERVER}/query`);
url.search = new URLSearchParams({
  where: "1=1", outFields: "*", f: "geojson", resultRecordCount: "500",
}).toString();
const fc = await fetch(url).then(r => r.json()); // GeoJSON FeatureCollection
```

Useful parameters:

| Param | Use |
|---|---|
| `where` | SQL-ish filter, e.g. `STATUS='Active'`. `1=1` means all |
| `outFields` | `*` or a comma list. Fewer fields = faster |
| `resultRecordCount` / `resultOffset` | Paging. Server caps ~1000–2000/request |
| `geometry` + `geometryType=esriGeometryEnvelope` + `spatialRel=esriSpatialRelIntersects` | Bounding-box filter |
| `outSR=4326` | Force WGS84 lon/lat. **Use this** — some layers are in a projected CRS |
| `returnCountOnly=true` | Row count without the payload; use to size a dataset before pulling |
| `f=geojson` | Always. `f=json` returns Esri's own format, which is more work |

Inspect a layer's fields and row count before writing code against it:

```bash
curl -s "<featureserver>?f=json" | python3 -m json.tool | head -40
```

## High-signal layers (verified, with real row counts)

| Layer | Rows | Why it matters |
|---|---|---|
| `Cityworks_Service_Requests` | 477,343 | **The crown jewel.** Real municipal service requests with `DESCRIPTION`, `ADDRESS`, `COMMUNITY`, `DISTRICT`, `REQUEST_CATEGORY`, `LATITUDE`/`LONGITUDE`, `DATE_INITIATED` + `DATE_CLOSED` (→ resolution time), `STATUS`, `DEPT_RESPONSIBILITY` |
| `Canadian_Index_of_Multiple_Deprivation_2021` | 605 | Vulnerability quintiles per dissemination area: `RESINST_Q` (residential instability), `ECONDEP_Q` (economic dependency), `ETHCULT_Q` (ethnocultural), `SITVUL_Q` (situational vulnerability), `SUMQUINT`. Polygons |
| `Transit_Automated_Passenger_Counts` | 728,590 | Real ridership by `Route_Number`, `Route_Direction`, `Route_Hour`, `Route_Date` |
| `Transit_Ferry_Passenger_Counts` | 525,430 | Ferry ridership, same shape |
| `Bicycle_Counts` | 883,348 | Active-transport counts |
| `311_Call_Details` | 4,961,240 | **Call-centre metadata only** — queue, outcome, wrap-up category, talk/duration seconds. No text, no location. Good for wait times and category trends; *not* "what's broken and where" |
| `HRM_Tax_Bill_Info` | 1,252,942 | Assessment/tax by property |
| `Sidewalk_Winter_Maintenance_Areas`, `Street_Winter_Maintenance_Areas`, `Transit_Bus_Snow_Routes`, `Winter_Parking_Ban` | — | Snow clearing, a perennial local grievance |
| `Proposed_Rapid_Transit_Network`, `Proposed_Rapid_Transit_Walksheds` | — | Transit futures, map-ready lines/polygons |

### The strongest overlay

`Cityworks_Service_Requests` × `Canadian_Index_of_Multiple_Deprivation_2021`:
**does Halifax fix problems more slowly in more deprived neighbourhoods?**
Resolution time = `DATE_CLOSED - DATE_INITIATED`, joined to deprivation quintile by point-in-polygon on `LATITUDE`/`LONGITUDE`. Fully answerable from live public data, renders as a map, and is a real equity question rather than a toy.

Other pairs: transit walksheds × deprivation (who is stranded); winter sidewalk routes × walksheds (who can't reach a bus in February).

### Not available
`Coastal_Flood_Extent_*` and `Pluvial_Fluvial_Flood_Extent_*` (2100 / 1-in-20 / 1-in-100) all return **`499 Token Required`**. Do not plan a flood-mapping demo around live queries.

## Gotchas

- Some layers are **projected, not lon/lat** — always pass `outSR=4326`.
- `resultRecordCount` is capped server-side; check `exceededTransferLimit` in the response and page with `resultOffset`.
- A few of the 353 are apps or web pages, not data — those have no `featureserver`. `find.py` only returns queryable ones unless you pass `--all`.
- Large polygon layers (flood extents, lidar) are heavy. Filter by bounding box, or pull once and cache to Supabase rather than querying live in the demo path.
- **Cache anything on the demo path.** See the `demo-safe` skill — conference wifi is not a dependency you want.
