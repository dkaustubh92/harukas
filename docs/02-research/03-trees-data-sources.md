# Tree data sources and implementation limits

**Reviewed: 12 Sep 2026, ~11:31 ADT.** Based on the teammate's eight source leads,
the existing HRM catalogue, official catalogue pages, and read-only HRM queries.
This is source research. It does not add features to the build scope.

## The supplied sources

| # | Source | Verified role and decision |
|---|---|---|
| 1 | [HRM Public Trees](https://data-hrm.hub.arcgis.com/datasets/HRM::public-trees/about) | Keep as the core asset source. The existing REST layer returned 80,051 point records. Species, diameter band, wires, recorded owner, and maintenance responsibility are available. A nearby asset is a candidate match, not confirmed tree identity. |
| 2 | [Tree Canopy catalogue](https://data.urbandatacentre.ca/catalogue/tree-canopy) and [linked HRM item](https://data-hrm.hub.arcgis.com/documents/HRM::tree-canopy/about?path=) | The catalogue describes canopy polygons across urban and rural HRM, grouped by community. Useful for map context. Canopy does not establish individual tree condition, ownership, or likelihood of failure. The geometry download and its observation date remain unverified. |
| 3 | [Population and dwelling counts](https://open.canada.ca/data/en/dataset/4c0ff480-01b3-4c07-95af-db8a3a93f246) | Official metadata confirms 2021 population, dwellings, land area, and population density at dissemination-area level, Table 98-10-0015. Use as demographic context. Downloads were not ingested. |
| 4 | [2021 Census boundary files](https://open.canada.ca/data/en/dataset/ef70dc3b-1069-4037-9bce-61f47e628a1d) | Official metadata confirms DA polygons and geographic identifiers, with cartographic and digital versions. Supports spatial joins to the same census vintage. These are census boundaries, not property or utility ownership boundaries. |
| 5 | Transmission lines | Teammate reports unavailable. No usable utility-network layer is verified for this project. This is a project data gap, not proof that no public data exists. Transmission corridors alone would not establish local distribution connections or outage impact. |
| 6 | [Nova Scotia GIS data page](https://novascotia.ca/natr/meb/download/gis-data.asp) | The supplied page is a Geoscience and Mines data directory, not a verified road layer. Keep as a discovery lead. Use the already catalogued HRM StreetNetwork for road geometry. |
| 7 | [Nova Scotia DataLocator](https://nsgi.novascotia.ca/datalocator/) | Verified discovery portal for geographic datasets, map indices, and elevation data. Its existence does not verify a particular ownership, road, or power-line dataset. |
| 8 | [2021 Census Geographic Attribute File](https://open.canada.ca/data/en/dataset/1b3653d7-a48e-4001-8046-e6964bebe286) | Official metadata confirms block-level population, dwellings, land area, and higher-level geographic codes. It also includes DA representative coordinates. Useful for aggregation and geographic lookup. Representative points do not replace boundary polygons. Downloads were not ingested. |

## HRM already supplies a useful census layer

The [Census 2021 Dissemination Areas layer](https://services2.arcgis.com/11XBiaBYA9Ep0yNJ/arcgis/rest/services/Census_2021_Dissemination_Areas/FeatureServer/0)
returned 610 polygons. Its fields include `DAUID`, `DAPOP2021`, `DAAREA`, and
`DAPOPDEN`. This is a simpler candidate for a demographic overlay than importing
and joining the national downloads during the hackathon.

The [Tree Equity Score by DA layer](https://services2.arcgis.com/11XBiaBYA9Ep0yNJ/arcgis/rest/services/Tree_Equity_Score_by_DA/FeatureServer/0)
returned 609 polygons with `DAUID`, `CANOPY_AREA`, `CANOPY_COVER`, and
`PRIORITY_INDEX`. It has no population fields. Its planting-priority index is not
a hazard score. Metadata, counts, and one sample from each layer were checked.
Full coverage, missingness, and the join have not been validated.

For a later overlay implementation:

1. Assign the report point to a 2021 DA polygon. Flag missing or ambiguous locations.
2. Read population and density from that DA. Label the values **2021 Census**.
3. If canopy context is needed, join by `DAUID`, normalized to the same string format.
   Retain unmatched DAs. The two layer counts differ, so do not assume full coverage.
4. Treat resident density as area context. It does not measure pedestrians at a bus
   stop, people beneath a tree, or residents who would lose power.
5. Seed any selected data before the demo. Keep source dates and join uncertainty
   with the report. Use a suitable projected CRS for distances and areas, and
   `outSR=4326` when requesting coordinates for a web map.

## Corrections from the tree schema

The [Public Trees REST metadata](https://services2.arcgis.com/11XBiaBYA9Ep0yNJ/arcgis/rest/services/Public_Trees/FeatureServer/0?f=pjson)
defines `DBH` as a coded diameter band. Codes 1 through 9 have labels. For example,
code 4 means **31 to 45.9 cm**, not a measured diameter of 4 cm or 45 cm.
A grouped query found 576 null values and one record with code 11, which has no
published label. Display unmapped codes as **Unknown diameter band** with the raw
code in staff details. Do not invent a range or display a scale of 11 classes.

`OWNER` and `MAINTBY` describe the inventory asset. They do not prove ownership of
an arbitrary reported location. `INSTYRCONF` and `SIZE2CONF` provide confidence
metadata. A planting year is not a measured biological age. No last-pruned field
or full health-history feed was found in this schema.

Use `WIRES` as recorded context, with unknown values preserved. It provides no
clearance distance, voltage, live-wire status, or utility-network connectivity.
Missing inventory coverage does not prove that a tree is private.

The [StreetNetwork layer](https://services2.arcgis.com/11XBiaBYA9Ep0yNJ/arcgis/rest/services/StreetNetwork/FeatureServer/0)
metadata and sample were also checked. It supplies road geometry and attributes,
not live traffic, crew locations, or confirmed emergency routes.

## Remaining data dependencies

Property and right-of-way boundaries, utility networks, field-crew locations,
equipment availability, dispatch commitments, live events, and weather enrichment
are not verified integrations. Keep them in the broader vision. Retain the HRM
attribution and the licence links from each source if their data ships.
