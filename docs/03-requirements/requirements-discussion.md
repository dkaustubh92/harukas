# Requirements discussion

**Updated: 12 Sep 2026. Status: confirmed discussion record.**
The confirmed answers below override conflicting assumptions in the earlier build
plan and scope. The completed [product requirements](product-requirements.md) and
[technical contract](technical-contract.md) translate these answers into the build
specification. Application workflow development has not started.

## Latest confirmations

- Be ready at **14:00 ADT today**. The hard deadline overrides the original full
  90-minute build plus 60-minute improvement allocation.
- Complete detailed requirements before starting development.
- Use OpenRouter `openai/gpt-5.6-luna` with high reasoning effort for all app text
  and image processing. This replaces the earlier Claude app-model choice.
- Use Supabase project `mgelmrwklixmhdhfxypk` and GitHub `dkaustubh92/harukas`.
- `OPENROUTER_API_KEY` is detected locally without displaying it. The Supabase URL
  matches the supplied project. The server-role credential and backend writes
  remain setup checks. No model or persistence success is implied.
- Luna max subagents are allowed for bounded development or review tasks. The
  app high effort setting is separate from those agent settings.

## Confirmed in round one

- The opening screen serves citizens on a mobile web app.
- Citizen reporting requires a photo and the tree's location, supplied through an
  address or current location. The teammate's process notes remain the input reference.
- The citizen map helps people identify areas to avoid after an incident has occurred.
- The officer's map is central to analysis, visualization, and decision-making.
- AI fills report information from the citizen's submission, including the photo.
  Officer-side analysis helps categorize and prioritize reports and understand the
  possible impact of leaving a tree issue unresolved.
- The demo uses a citizen phone and a separate staff laptop. Newly submitted reports
  must be shared across devices. Browser-local state alone cannot satisfy this flow.
- The timing target remains a working app after 90 minutes, then 60 minutes for
  incremental improvement, subject to the event deadline.
- Municipal handoffs remain simulated. No real requests, dispatches, or notifications
  are sent to Halifax or other agencies.

These answers make photo analysis, location input, maps, and shared report storage
core requirements. They supersede the earlier suggestions to defer those features.
Round two below settles map fidelity, report review, and the first impact scenario.

## Confirmed in round two

- The citizen reviews and can correct AI-filled details before submission.
- The officer's main task is deciding whether to send people and what response is needed.
- The user values 3D for visual impact. They did not make a full 3D simulation a
  requirement or choose a particular rendering technology.
- The user delegates the public map warning policy and first impact scenario to
  the implementation team.

## Decisions made under that delegation

- New citizen reports appear as **Unreviewed report** markers. An officer can
  review the evidence and mark a reported road or sidewalk obstruction. Only then
  does the citizen view highlight an area to avoid. The marker remains a reported
  obstruction, never an official road-closure notice. Seeded scenarios and staff
  actions are visibly part of the demo.
- The main scenario is a tree threatening road and sidewalk access. The staff
  view shows the nearby road and an illustrative affected area. This makes the
  decision to inspect or clear an obstruction concrete without requiring power
  network, traffic, or fleet data.
- Existing reported damage and the **If unresolved** scenario are different layers.
  Only the officer sees the hypothetical impact layer. Never publish a predicted
  footprint as an existing public obstruction.
- Prefer a tilted map with 3D buildings where available and a selected-report
  impact overlay. Keep the map fully usable in 2D if building data or rendering
  takes too long. No physics simulation or exact tree-fall prediction is required.
- The officer can review or adjust priority, request inspection, mark an obstruction,
  simulate assigning a response, and resolve a demo report. Suggested response
  types are inspection, obstruction clearance, and specialist review. No real crew
  is assigned and no operational arrival time is shown.
- Staff actions update the shared report so the citizen phone can see progress
  inside the app. This is a demo status update, not an outgoing SMS, email, or
  municipal notification. Public views exclude reporter contact details.

## First working path

Citizen phone opens the map → uploads a photo and confirms the tree location →
Luna fills a draft → citizen reviews and submits → the staff laptop receives
the report → officer examines the map, priority, evidence, and impact scenario →
officer simulates assigning a response → citizen sees the updated demo status.

The municipal overview and report-link preview remain available on the report,
with a simulated receipt and no real submission.

## Clock check

The user confirmed the 14:00 ready deadline after the 12:03 discussion. Target the
working path within 75 minutes of implementation start and reserve the final
15 minutes before 14:00 for verification and rehearsal. Follow the current
[execution plan](execution-plan.md), not the earlier 150-minute proposal.

The existing evidence limits still apply: nearby assets are candidate matches,
inventory values are not photo measurements, and impact scenarios must be labelled
according to what the available data can support.
