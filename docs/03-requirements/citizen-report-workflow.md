# Citizen reports and staff review

**Reviewed: 12 Sep 2026. Teammate proposal assessment, not the current build contract.**
The [product requirements](product-requirements.md) now define the build. They
require one photo, a confirmed tree location, AI review, and shared phone-to-laptop
storage. Contact collection, fleets, and real notifications are deferred. The
proposal details below explain what was considered and must not make current
required inputs optional.

## Useful citizen inputs

| Input | Proposed behaviour |
|---|---|
| Incident category | Let the citizen choose tree damage, obstruction or accessibility, possible utility conflict, or other/unsure. AI may suggest a category for the citizen to correct. These are HaruKas categories, not verified HRM priority codes. |
| Observations | Offer prompts for hanging limbs, visible splits, a new lean or lifted soil, cavities or fungi, blocked signs, sidewalk encroachment, and lifted pavement. Store what the citizen reports without converting it into a diagnosis. |
| Nearby people and structures | Ask what is beside or beneath the tree: sidewalk, road, bus stop, playground, house, or driveway. Ask whether access is partly or fully blocked, with an unknown option. |
| Recent event | Storm, wind, ice, vehicle impact, other, or unknown. Record the reported timing. Do not assume that an event proves structural instability. |
| Photo | Suggest a wide view and, only from a safe position, a detail view. Do not require approaching a damaged tree or wires. Poor or missing images must leave an unknown state. |
| Size | Allow an optional citizen estimate with units and its source. A photo alone must not produce an exact height, branch diameter, or equipment requirement. |
| Location | Offer location sharing with consent, manual address, or a park/landmark description. Ask the citizen to confirm the incident location because their phone location may be somewhere else. Geocoding and landmark search remain unimplemented. |
| Contact information | The municipal preview includes first name, last name, email, and phone. Use fictional contacts in seeded demos. Keep contact details out of public report links and image metadata. |

Halifax's form accepts one attachment up to 2 MB. Multiple photos inside HaruKas
are a separate product choice. For a municipal preview, select one supported file
or a compact PDF if export is later built. See [handoff constraints](municipal-handoff.md).
No file is uploaded to Halifax in the prototype.

## Citizen receipt and staff view

The citizen sees the HaruKas report reference, timestamp, reported location,
observations, and a preliminary inspection priority with reasons. The receipt
separately shows **Not sent to Halifax**. A saved HaruKas report is not an official
municipal request.

Queue transparency is useful only when its meaning is visible: show the rank in
the **HaruKas demo snapshot**, its total, and its timestamp. Derive those values
from the displayed data. Do not present them as HRM's live dispatch order or mix
synthetic reports into the count of real open municipal requests without labelling.

Staff see the original observations and photo, existing request priority and age,
a candidate inventory match with distance, available asset fields, source
timestamps, missing inputs, and the proposed priority.
Keep citizen observations, inventory facts, and AI suggestions distinguishable.
The staff member can accept, adjust, or mark the recommendation as needing field
verification, with a reason retained.
An in-app review action must not dispatch a crew or change a municipal record.

An exportable incident summary is a useful later addition. It should include the
report reference, date, evidence, sources, uncertainty, and demo status. Downloading
a report does not imply that an agency, insurer, or property manager received it.

## Triage reasoning and claims to avoid

The teammate's failure, impact, and consequence dimensions are useful prompts for
organizing evidence. Their multiplication formula does not establish a calibrated
1–100 risk score. If the prototype uses a score, label it as a **prototype triage
score**, show its inputs, and do not interpret it as a failure probability.

The [ISA assessment instructions](https://www.isa-arbor.com/Portals/0/Assets/PDF/Certification-Applications/ISA-Basic-Tree-Risk-Assessment-Form-Instructions.pdf)
describe categorical assessments and risk matrices. HaruKas has not demonstrated
ISA compliance or completed a professional assessment. Avoid claims of imminent
failure, calibrated image-confidence percentages, or automatic compliance.

| Teammate proposal | Documentation decision |
|---|---|
| Automatic property classification | Show the candidate asset's recorded owner where available. Keep report jurisdiction unverified until the asset and relevant boundaries are confirmed. |
| Dispatch in 2 hours, 4–8 hours, or a 24-hour SLA | Defer. No verified HRM service commitment or crew feed supports these promises. Show **Dispatch time unavailable**. |
| School-hour, transit, event, and weather multipliers | Retain as future context. No current occupancy feed or validated multiplier is established. |
| Live crews, equipment selection, optimized routes, repair estimates | Retain as future operational integration. Do not invent crew positions, equipment availability, or time saved. |
| One-click dispatch, NSP cross-dispatch, SMS, and email updates | Simulate inside HaruKas only. Do not send messages, create work orders, or claim that anyone was notified. |
| Exact utility clearance or outage footprint | Defer. `WIRES` and images do not supply a verified electrical network or measured clearance. |

## Urgent guidance uses an official source

Show urgent guidance when the citizen reports downed wires or immediate danger.
It must not depend on successful image analysis, and a negative model result must
not imply that wires are safe.

[Nova Scotia Power's safety page](https://www.nspower.ca/about-us/safety), checked
12 Sep 2026, directs people near downed wires to keep at least 20 metres away and
call 911. The teammate's `1-800-428-6230` appears on that page for requesting safety
presentations. Do not use it as the emergency number in this flow.

Keep the action with the person reading the guidance. The prototype does not call
emergency services or flag Nova Scotia Power. All municipal handoffs remain subject
to the [no-real-submission requirement](municipal-handoff.md#prototype-constraint).
