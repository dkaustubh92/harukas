# HaruKas prototype requirements

**Status: development specification, 12 September 2026. Application workflows are not implemented.**
**Ready deadline: 14:00 ADT today. Complete requirements before starting development.**

This document defines the current product scope for challenge **#3, Which Tree Falls First**.
It supersedes the earlier scope and 150-minute proposal. The
[technical contract](technical-contract.md) defines the data and API boundaries.
The [acceptance checklist](acceptance-checklist.md) defines completion evidence.

## Product objective

Help a resident report a tree incident with a photo and location. Help an officer
review the evidence, prioritize an inspection or response, and understand possible
road or sidewalk disruption. Show the resulting status on the resident's phone.

The demo follows one report across two devices. It uses the team's Supabase
database for shared state. Halifax's official system receives nothing.

## Users and outcomes

| User | Device | Successful outcome |
|---|---|---|
| Citizen | Mobile browser | Finds reported obstructions, submits an accurate report, and follows its demo status |
| Officer | Laptop browser | Sees the new report, understands its evidence and uncertainty, and records a response decision |
| Presenter | Both devices | Demonstrates the complete path, including the municipal preview, within three minutes |

The citizen is the default opening experience. Use an **Officer demo** link to
open the staff workspace. This is a shared demonstration, without account signup
or a claim that switching views authenticates an officer. Reports and photos used
in the demonstration must be suitable for sharing with demo viewers.

## Scope and priorities

P0 is required for the working app. P1 is optional improvement after the complete
P0 path works. The deadline takes precedence over the original 90-plus-60-minute budget.

| ID | Priority | Requirement |
|---|---|---|
| CIT-01 | P0 | Citizen home contains an interactive Halifax map, incident legend, report list fallback, and prominent report button |
| CIT-02 | P0 | Reporting requires one photo and a confirmed tree location |
| CIT-03 | P0 | Luna suggests editable report details, which the citizen reviews before submission |
| CIT-04 | P0 | A receipt and shareable report page show the saved reference and current demo status |
| OFF-01 | P0 | Staff workspace combines a map, ordered queue, and selected-report evidence panel |
| OFF-02 | P0 | Triage labels include their reasons and missing evidence, with a human override |
| OFF-03 | P0 | Officer can record review, request inspection, simulate response assignment, and resolve a demo report |
| MAP-01 | P0 | Public map distinguishes unreviewed reports from staff-reviewed reported obstructions |
| MAP-02 | P0 | Staff can toggle an illustrative road or sidewalk impact scenario for a selected report |
| DATA-01 | P0 | Reports, photos, and staff status changes persist across the phone, laptop, and refresh |
| HAND-01 | P0 | Municipal preview contains an overview and report link, followed by a simulated receipt |
| DEMO-01 | P0 | Seeded examples and an explicitly labelled cached-analysis fallback support rehearsal |
| VIS-01 | P1 | Tilted map and 3D buildings add useful context without breaking the 2D experience |
| CTX-01 | P1 | Census density and canopy context add source-labelled map layers |

## Citizen experience

### Home and map

The opening map shows Halifax with available reports. A legend explains marker
status with text and shape as well as colour. A compact list remains usable if
map tiles fail. Selecting a marker opens its summary and report link.

Show **Unreviewed report** for new submissions. Show **Reviewed reported
obstruction · Demo** only after a staff review identifies blocked road or sidewalk
access. Use a conspicuous marker or halo at the report location. It does not define
an official closure boundary or a safe alternative route.

Resolved demo reports remain accessible from their links and are hidden from the
active obstruction layer. An empty map says that no reports are displayed, without
claiming that the surrounding area is safe.

### Photo and tree location

Open a report sheet with these fields. Keep secondary observations under an
optional details section so the first screen stays short.

| Field | Required | Behaviour |
|---|---|---|
| Photo | Yes | One JPEG, PNG, or WebP image, with preview, replace, and remove controls. Browser photo picker may offer the camera |
| Address or landmark | An address or consented current location starts location selection | Editable label, with a suggested map position when lookup succeeds |
| Current location | Optional alternative to typed address | Request browser permission only after the citizen selects **Use current location** |
| Tree pin | Yes | Citizen confirms the tree's position on the map. Moving the pin clears the prior confirmation |
| Category | Yes, defaults to other or unsure | Tree damage, access obstruction, possible utility conflict, or other or unsure |
| Observations | Optional before analysis | Short description and editable observations suggested from the image |
| Nearby targets | Optional | Road, sidewalk, bus stop, playground, building, driveway, other, or unknown |
| Damaged part above a target | Optional, defaults to unknown | Yes, no, or unknown. Review any AI suggestion before it contributes to priority |
| Obstruction | Optional, defaults to unknown | None reported, partial, full, or unknown |
| Recent cause | Optional, defaults to unknown | Storm, wind, ice, vehicle impact, other, or unknown |
| Wires or immediate danger | Optional direct report | Yes, no, or unknown. This answer works without an AI call |

Support address lookup and consented browser geolocation. If either fails, preserve
the entered label and allow manual map placement. A typed address alone cannot
silently produce a report at Halifax's centre. The phone position is a starting
point, because the citizen may be standing away from the tree.

Accept source images up to 10 MB. Before upload, normalize supported images to
JPEG at no more than 2 MB and remove embedded metadata. Reject an unsupported or
unreadable image with a useful message. These are prototype upload choices, distinct
from the independently verified municipal form's one-file, 2 MB limit.

Do not require names, email addresses, or phone numbers in this version. The
teammate's contact fields belong to future official intake. The municipal preview
uses clearly fictional contact values. Multiple photos, PDF input, precise tree
dimensions, and park autocomplete are deferred.

### AI draft and citizen review

Selecting **Analyze photo** sends the photo, location, and supplied observations
to OpenRouter using `openai/gpt-5.6-luna` with high reasoning effort. The key stays
on the server. The user sees an analysis state and can continue manually on failure.

The draft contains a short title, category, visible observations, nearby targets,
reported obstruction, possible utility concern, and uncertainty. Each AI-suggested
field remains editable. Preserve original AI suggestions separately from the
citizen's corrected submission for staff review.

The model describes visible evidence. It does not certify tree health, identify
an exact fall time, measure height from an unscaled photograph, or confirm private
or municipal ownership. Unclear fields remain unknown. An unrelated image receives
a **No clear tree incident visible** result and a request to review or replace it.
Manual reporting remains available with an explanation and **Needs assessment**.

The final action is **Review and submit demo report**. Before enabling submission,
require a supported photo, confirmed tree pin, category, and explicit acknowledgement
that the citizen reviewed the details. Replacing the photo or moving the tree pin
invalidates prior analysis and review. Changing incident details clears the review
acknowledgement. A model response alone never submits a report.

### Receipt and progress

After storage succeeds, show a unique `DEMO-` reference, submitted timestamp,
location, summary, status, and link to `/reports/[id]`. Show **Not sent to Halifax**
separately from the app's saving status. A failed save preserves the draft and offers
retry. Repeated taps or retries must not create duplicate reports.

The report page refreshes shared status while open. Its timeline distinguishes
citizen submission, officer review, simulated assignment, and demo resolution.
No dispatch ETA, queue guarantee, email, or SMS is promised.

## Officer experience

### Workspace and queue

At `/staff`, place the queue beside the map and selected-report panel. The panel
contains the photo, citizen-reviewed details, original AI suggestions, priority
reasons, missing evidence, and action controls. A list selection and its map marker
select the same report. Filters cover status and priority. Counts come from the
displayed dataset and active filters.

New submissions become visible within 10 seconds on a healthy connection. Polling
is sufficient. Show loading, empty, stale-data, and retry states. Keep the selected
report stable when another report arrives.

### Triage and human review

Use **Urgent review**, **Priority review**, **Routine review**, and **Needs
assessment**. These are HaruKas prototype inspection priorities, not HRM priority
codes, clinical-style safety ratings, or probabilities of tree failure.

| Suggested label | Evidence rule |
|---|---|
| Urgent review | Citizen reports immediate danger, downed wires, or a full road or sidewalk obstruction |
| Priority review | Citizen reports partial access obstruction, a possible utility conflict, or a damaged or hanging part above a reported target |
| Routine review | A described issue has no reported urgent trigger or access obstruction and has sufficient evidence for that limited classification |
| Needs assessment | Evidence is missing, contradictory, unrelated, or insufficient to classify |

Apply the strongest matching trigger. Unknown evidence cannot establish a routine
case. A routine suggestion requires an actual described issue, obstruction set to
none, utility concern set to no, and immediate danger set to no. If any of those
trigger answers is unknown and no stronger rule matches, use needs assessment.
Queue order is urgent, priority, needs assessment, then routine. Break ties
by oldest submission. Resolved reports are excluded from the active queue.
Retain the rule and its supporting fields with each suggestion.

AI supplies structured observations and a concise explanation. Server rules derive
the initial priority from reviewed inputs. Staff may accept or change the priority
with a recorded reason. Recompute a rule-based suggestion after citizen corrections.
Never display an explanation that describes superseded inputs as current facts.

### Review and response actions

| Action | Required effect |
|---|---|
| Mark reviewed | Records a review event and preserves the report's evidence |
| Adjust priority | Saves the selected priority and reason while preserving the original suggestion |
| Request inspection | Records the chosen response as inspection and shows **Inspection requested · Demo** |
| Mark reported obstruction | Records partial or full road or sidewalk obstruction, reviewer note, and timestamp. Enables the public warning marker |
| Simulate response assignment | Saves inspection, obstruction clearance, or specialist review as the response type. Shows **Response assigned · Demo** |
| Resolve demo report | Records a resolution note and removes this report's active warning marker |

The system records a human decision. It does not select a real crew, contact a
utility, dispatch staff, create a municipal work order, or claim that a road has reopened.

### Evidence and possible impact

Show citizen observations, AI suggestions, and municipal inventory facts in
separate labelled sections. Where available, show the nearest candidate tree's
identifier, distance, recorded species, published diameter band, and wires flag.
An inventory match is a candidate until verified. No nearby record means unknown
inventory context, not private ownership.

The default scenario concerns road or sidewalk access. The **If unresolved** toggle
shows a dashed illustrative area around the selected location and explains the
possible disruption. A fixed visual buffer, if used, is labelled as an illustration
rather than a measured tree-fall radius. It is visible only in the staff view.
It must never populate the citizen obstruction layer.

The impact card answers: what access could be affected, which evidence supports
that concern, what remains unknown, and what response the officer can consider.
Do not invent traffic volume, people affected, travel delays, live occupancy,
power-network connections, repair costs, or avoided-loss figures.

## Municipal preview

From the selected report, open **Municipal intake preview**. Include fictional
contact fields, the reported location, one photo reference, and an editable overview
with the report URL. The overview and URL together must fit 500 characters. Preserve
the full URL when shortening text. Show the count and validate the published field
limits in [the handoff reference](municipal-handoff.md).

**Simulate municipal submission** saves a simulated receipt in HaruKas. Both the
preview and receipt show **Demo only. Not sent to Halifax.** A repeated action
returns the same receipt for that report. Its link opens the saved report on either
device. It does not expose contact information or upload the photo to Halifax.

There is no live submission implementation, automation switch, or environment
setting that enables one. This prohibition includes development and testing.

## Data and presentation requirements

- Use the confirmed Supabase project `mgelmrwklixmhdhfxypk` for reports and photos.
- Show the same saved report and staff action on both devices after refresh.
- Cache a small Halifax tree and road context sample before the demo. Source
  availability must not block a citizen submission.
- Label synthetic examples as **Seeded demo** and new submissions as **Demo report**.
- Populate the map and queue with 25 fictional existing reports from the separately
  assigned fixture task. Images for those existing fixtures are optional, with at
  most one generated image per incident and explicit image provenance. A missing
  fixture photo shows **Photo unavailable**. New citizen submissions still require
  a photo. Include one suitable photo-backed example for rehearsal.
- Label any real municipal request snapshot with its source date. Keep its counts
  separate from synthetic and newly submitted demonstration reports.
- Show source attribution and missing context. Census density is 2021 area context,
  not a live count of people near a tree.
- Design for a 390 px phone and a 1366 px laptop without horizontal page scrolling.
- Use readable labels, accessible form errors, visible keyboard focus, and touch
  targets of at least 44 px. Colour alone must not communicate priority or status.
- Use a calm map background, restrained priority colours, and one obvious next
  action. Keep storage, model configuration, and implementation details out of the
  citizen flow unless needed to explain an error.

If the citizen reports downed wires, display official urgent guidance independently
of the model. The reviewed [Nova Scotia Power safety guidance](https://www.nspower.ca/about-us/safety)
says to stay at least 20 metres away and call 911. The app does not make that call
or claim to notify anyone. Failure to detect wires is not evidence that a site is safe.

## Explicit exclusions

Defer live municipal integration, real dispatch, fleet positions, equipment
availability, route optimization, arrival estimates, outbound notifications,
production account management, exact tree-fall prediction, calibrated numerical
risk scores, automatic property jurisdiction, and ISA-compliance claims.

Weather multipliers, transmission networks, citywide canopy processing, PDF export,
multiple attachments, automated photo annotations, and conversational staff chat
are outside the first working version. See [the execution plan](execution-plan.md)
for the cut order and [source research](../02-research/03-trees-data-sources.md) for
the evaluated datasets.

## Decisions and readiness

Confirmed by the user: citizen opening screen, photo and tree location, editable
AI review, map-led officer analysis, response decisions, two-device demo,
OpenRouter Luna at high effort, the existing Supabase project, and the 14:00 deadline.

Coordination with the user's separate seed-data task adds 25 fictional existing
reports and confirms that 2D or 2.5D maps are acceptable to save time. The fixture
task owns `lib/demo-incidents.ts` and `public/demo-incidents/`; do not create a
competing seed batch. Those paths are reserved outputs, not yet verified assets.

Implementation choices made to meet that scope: one photo, no contact collection,
four categorical priorities, polling, a road or sidewalk scenario, reviewed public
warnings, and optional 3D. These choices keep the first build finite.

The requirements are complete enough to begin development. Outstanding technical
setup is listed in the technical contract. It is not evidence that storage,
deployment, model calls, or any acceptance test already works.
