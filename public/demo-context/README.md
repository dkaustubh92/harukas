# HRM context for the demo

This folder contains real geographic context for fictional incidents. It is a
local snapshot collected from HRM's public ArcGIS services. No municipal request,
database mutation, or dispatch takes place during collection.

| File | Contents |
|---|---|
| `roads.geojson` | WGS84 road segments on the roads selected for the demonstration |
| `trees.geojson` | WGS84 in-service tree inventory points within a 150 m envelope around each demo pin |
| `location-suggestions.json` | Synthetic incident placements on named road geometry, with source road IDs |
| `report-context.json` | Report ID to nearest candidate tree within 60 m, or explicit no-match |
| `manifest.json` | Collection time, source URLs, feature counts, field domains, query scope, and fixture hash |

The candidate join is contextual. The incidents are fictional, so a nearby tree
cannot be identified as the subject of an actual complaint. Do not describe these
trees as damaged or unsafe. Preserve the raw inventory values and show `dbhLabel`
for diameter bands. `wiresLabel` is a recorded flag, not electrical clearance.
Road geometry does not establish traffic, live closures, or tree ownership.

The fictional reports and photo mapping are exported by
[`lib/demo-incidents.ts`](../../lib/demo-incidents.ts). Those fixtures deliberately
keep municipal context empty. The future application can join this cache by report
ID, while retaining its **Candidate only** label and the collection timestamp.
Photos are representative and do not verify the reports or their locations.

## Refresh the local cache

Run the collector from the repository root:

```sh
python3 scripts/collect-demo-context.py --locations-only
```

Review the suggested positions before changing fixture coordinates. The collector
does not modify the reports. Once their locations match the reviewed suggestions,
collect the tree context:

```sh
python3 scripts/collect-demo-context.py
python3 scripts/validate-demo-context.py
```

Both commands use public read-only endpoints from the repository's verified HRM
catalogue. They write only local context files. The full collector fails if the
fixture pins have not been aligned with their road suggestions. Do not run it on
the live demonstration path. Serve the cached GeoJSON instead.

## Attribution

Contains information licensed under the
[Halifax Regional Municipality Open Data Licence](https://data-hrm.hub.arcgis.com/pages/open-data-licence).
Data © Halifax Regional Municipality. HRM does not endorse the fictional incidents
or this application.

Sources: [HRM Public Trees](https://services2.arcgis.com/11XBiaBYA9Ep0yNJ/arcgis/rest/services/Public_Trees/FeatureServer/0)
and [HRM StreetNetwork](https://services2.arcgis.com/11XBiaBYA9Ep0yNJ/arcgis/rest/services/StreetNetwork/FeatureServer/0).
