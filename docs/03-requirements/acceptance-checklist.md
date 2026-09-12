# Acceptance checklist

Use this checklist with [product-requirements.md](product-requirements.md) and
[technical-contract.md](technical-contract.md). Run the P0 scenarios on the deployed
app with a citizen phone and a separate officer laptop. A scenario passes only
when every condition under **Pass when** is observable. This file defines the
tests; it does not claim that anyone has run them.

## Test setup

- Use separate browser sessions on the citizen phone and officer laptop.
- Prepare one representative tree photo, one new report, and at least one seeded
  report.
- Mark seeded reports, synthetic responses, and demo references in the app.
- Route every app LLM or image-model call through OpenRouter with model
  `openai/gpt-5.6-luna` and reasoning effort `high`.
- Keep the live Halifax form closed. The prototype must not submit municipal data.

## P0 scenarios

### P0-01 | Create a shared report from the citizen phone

1. Open the citizen mobile home and choose the report action.
2. Upload the tree photo.
3. Enter an address or choose consented current location.
4. Adjust the map marker if needed, then confirm the tree location.
5. Submit the reviewed report.
6. Leave the officer queue open and measure the time until the new report appears.
7. Refresh the officer laptop and open the new report.

**Pass when:**

- The same report reference appears on both devices.
- The officer view contains the submitted photo and confirmed location.
- On a healthy connection, the new report appears in the visible officer queue
  within 10 seconds of the successful phone save.
- The report appears after a laptop refresh without relying on browser-local state.
- The citizen view shows a saved HaruKas report status.

### P0-02 | Keep the report and photo after refresh

1. Open the saved report on both devices.
2. Refresh both pages and reopen the report from its reference or report link.

**Pass when:**

- The report reference, photo, confirmed location, observations, and status remain
  unchanged after refresh.
- The officer laptop and citizen phone still open the same report.
- The saved photo does not depend on the first browser session remaining open.

### P0-03 | Let the citizen correct the AI draft

1. Create a report with a photo and confirmed location.
2. Wait for the AI-filled draft.
3. Change the incident category and at least one observation.
4. Submit the report, then refresh it.

**Pass when:**

- The draft fields are editable before submission.
- The citizen's corrections appear in the submitted report after refresh.
- AI suggestions, citizen observations, and unknown values remain distinguishable.
- The photo alone does not become an exact tree height, branch diameter, diagnosis,
  or equipment requirement.

### P0-04 | Use the required model for every AI call

1. Trigger each LLM or image-model action used by the reporting and triage flow.
2. Inspect the request trace or server configuration for each action.

**Pass when:**

- Every app LLM or image-model request uses OpenRouter.
- Every request uses `openai/gpt-5.6-luna`.
- Every request uses reasoning effort `high`.
- The flow makes no call to an alternate provider or model.

### P0-05 | Finish a report when the model fails

1. Make the OpenRouter call time out or return an invalid response.
2. Start a report with a photo and confirmed location.
3. Continue through the report review and retry the model call once.

**Pass when:**

- The photo and confirmed location remain available after the failure.
- The app shows a usable editable manual draft with unknown fields where analysis
  is unavailable.
- The app offers retry without discarding the report inputs.
- The app does not invent a diagnosis, confidence value, or impact claim.
- The citizen can submit the manual draft.

### P0-06 | Use a manual location when phone location is unavailable

1. Deny location permission on the citizen phone.
2. Enter a street address, landmark, or map placement.
3. Confirm the incident location and submit the report.

**Pass when:**

- The report saves the explicitly entered or placed location.
- The app shows that the citizen confirmed the tree location.
- The denied phone location does not silently become the tree location.

### P0-07 | Show a saving failure without claiming success

1. Interrupt storage or network access while submitting a report.
2. Observe the citizen status and refresh the officer queue.
3. Restore access and retry the save.

**Pass when:**

- The citizen sees a saving or retry state while storage is unavailable.
- The officer laptop does not show a received report before storage succeeds.
- A successful retry creates one report and one photo without a duplicate.
- The saved report becomes visible on the other device only after persistence.

### P0-08 | Triage a report and simulate a response

1. Open the new report in the officer workspace.
2. Review the original observations, photo, AI suggestions, candidate asset match,
   distance, source timestamp, missing inputs, and uncertainty.
3. Adjust the priority and retain a review reason.
4. Choose inspection, obstruction clearance, or specialist review.
5. Simulate assigning the response and resolve the demo report.
6. Repeat the same response action through its retry path.

**Pass when:**

- The queue shows a labelled HaruKas prototype triage rank with its inputs and
  reasons.
- The officer can accept or adjust the recommendation and retain a reason.
- The simulated response and resolution appear in the shared report history.
- Repeating an action with the same action ID returns the original result and does
  not create a second event or response.
- No crew is assigned, no arrival time is shown, and no municipal record changes.

### P0-09 | Publish an obstruction only after officer review

1. Submit a report that mentions a road or sidewalk obstruction.
2. Confirm that the new report starts as **Unreviewed report** on the citizen map.
3. On the officer laptop, review the evidence and mark the obstruction.
4. Refresh the citizen map.

**Pass when:**

- The new marker is visible before review but is not an official warning.
- The citizen map highlights an area to avoid only after the officer review action.
- The marker remains labelled as a reported obstruction.
- The citizen map never presents the marker as an official road closure.

### P0-10 | Keep the hypothetical impact layer staff-only

1. Select the reviewed report on the officer laptop.
2. Toggle the **If unresolved** impact view.
3. Refresh the citizen phone and open the same report.

**Pass when:**

- The officer view labels the layer as an illustrative hypothetical scenario.
- The layer shows the affected road or sidewalk separately from existing damage.
- The hypothetical layer is absent from the citizen map and public report link.
- The app does not show a failure probability, exact fall footprint, outage area, or
  official closure based on the hypothetical layer.

### P0-11 | Share the officer's demo status with the citizen phone

1. Simulate a response or resolution on the officer laptop.
2. Leave the citizen report page open and measure the time until the status changes.
3. Refresh the citizen phone and reopen the report status.

**Pass when:**

- The citizen sees the updated in-app demo status and the same report reference.
- On a healthy connection, the status change appears on the visible citizen report
  page within 10 seconds.
- The citizen view excludes officer-only impact details and reporter contact data.
- The status change sends no SMS, email, dispatch, or other external notification.

### P0-12 | Simulate every municipal handoff inside HaruKas

1. Open a report and generate the municipal intake preview.
2. Confirm that the preview uses fictional contact placeholders, then enter the
   location and short overview.
3. Confirm that the overview includes the HaruKas report URL.
4. Review the character count, then choose **Simulate municipal submission**.
5. Repeat **Simulate municipal submission** for the same report.

**Pass when:**

- The overview is 500 characters or fewer, including the report URL.
- The remaining-character count matches the displayed overview length.
- The preview and receipt display **Demo only. Not sent to Halifax.**
- The receipt uses a visibly simulated reference such as `DEMO-001`.
- The receipt links back to the HaruKas report.
- Repeating the handoff returns the same receipt and does not create a second
  receipt.
- No request, dispatch, notification, or form submission reaches Halifax or another
  municipal agency.

### P0-13 | Keep contact fields out of the report and public views

1. Create and submit a report without entering a name, email address, or phone number.
2. Open the saved report, citizen receipt, public report link, and officer view.
3. Open the municipal preview and inspect its contact fields.
4. Inspect any image preview or download exposed by the app.

**Pass when:**

- The report flow accepts submission without collecting reporter contact fields.
- The saved report, citizen receipt, public report link, and officer view contain no
  reporter contact fields.
- The municipal preview uses clearly fictional placeholder contact values only for
  the simulated form.
- The public report and any exposed image metadata contain no private contact data.

### P0-14 | Label seeded data and demo actions

1. Open the citizen map, officer queue, report detail, and municipal receipt.
2. Compare a seeded report with the new report.

**Pass when:**

- Seeded reports carry a visible seeded or demo label.
- Synthetic queue counts and statuses are labelled as a HaruKas demo snapshot.
- Simulated response and municipal references are visibly synthetic.
- The app does not claim that seeded data is a live municipal request or dispatch.

### P0-15 | Show urgent wire guidance without waiting for AI

1. Start a report that includes downed wires or immediate danger.
2. Make the OpenRouter call fail.

**Pass when:**

- The urgent guidance still appears when image analysis fails.
- The guidance tells the reader to stay at least 20 metres away and call 911.
- HaruKas does not call emergency services or notify Nova Scotia Power.

### P0-16 | Keep image uncertainty and the required photo explicit

1. Upload a supported but unclear or unrelated image.
2. Complete the confirmed pin, category, and review acknowledgement.
3. Choose the manual state and submit the report.
4. Start a second draft, remove its photo, and try to submit it.
5. Open the first report in the officer workspace.

**Pass when:**

- A supported unclear or unrelated image can be submitted through the manual path.
- The submitted report labels the image as unclear or unrelated. Without a stronger
  citizen-reported trigger, the case is **Needs assessment**.
- A missing photo blocks submission with a clear error and creates no receipt.
- Missing asset context, source timestamps, or field inputs are labelled unknown.
- A candidate asset remains a candidate and includes its distance and source time
  when those values exist.
- Inventory values are not presented as measurements from the photo.
- The report does not claim a calibrated risk score, service time, crew position, or
  utility clearance.

### P0-17 | Enforce required fields and invalidate stale review

1. Start a draft without a photo, and try to submit it.
2. Add the photo, leave the tree pin unconfirmed, and try to submit it.
3. Confirm the pin, leave the review acknowledgement clear, and try to submit it.
4. Complete the required fields, acknowledge the review, then change an incident
   detail, replace the photo, and move the pin in turn.
5. Restore valid inputs, review them again, acknowledge the review, and submit.

**Pass when:**

- The app blocks submission without a photo, a confirmed tree pin, or an explicit
  review acknowledgement.
- Each blocked attempt shows a field-specific error and creates no receipt.
- Changing incident details clears the review acknowledgement.
- Replacing the photo or moving the pin invalidates the prior analysis and review.
- A report submits only after the photo, confirmed pin, category, and current review
  acknowledgement are valid.

### P0-18 | Apply the priority rules and queue order

1. Prepare reports with downed wires, full obstruction, partial obstruction, a
   possible utility conflict, a sufficient non-urgent issue, and missing or
   contradictory evidence.
2. Open the officer queue and compare each suggested priority.
3. Correct a citizen detail and inspect the resulting suggestion.

**Pass when:**

- Downed wires, immediate danger, or full access obstruction produces **Urgent
  review**.
- Partial access obstruction, a possible utility conflict, or a damaged or hanging
  part above a reported target produces **Priority review**.
- A sufficient non-urgent issue with no urgent trigger or access obstruction produces
  **Routine review**.
- Missing, contradictory, unclear, or unrelated evidence produces **Needs
  assessment** when no stronger reported trigger matches. Unknown evidence never
  produces **Routine review**.
- The active queue sorts urgent, priority, needs assessment, then routine, with
  oldest submission first for ties. Resolved reports are excluded.
- A corrected citizen detail changes the suggestion and explanation, and superseded
  inputs are not shown as current facts.

### P0-19 | Reject an officer update based on a stale version

1. Open the same report in two officer tabs and note its version.
2. Save a review or priority action in the first tab.
3. Submit an action from the second tab using its old version.
4. Refresh the second tab and retry with the current version.

**Pass when:**

- The stale action returns a conflict that asks the officer to refresh.
- The first tab's saved decision and event remain unchanged.
- The retry with the current version succeeds once and records one new event.

### P0-20 | Keep secrets and database writes server-side

1. Inspect the browser bundle, environment values, and network requests during a
   report submission and a staff action.

**Pass when:**

- The browser receives no `OPENROUTER_API_KEY`, Supabase service-role key, or other
  server secret.
- The browser makes no direct table or storage writes to the demo tables or photo
  bucket.
- Report and staff mutations go through server route handlers that validate input.
- Report reads contain no server secrets, storage signing keys, or contact fields.
  A short-lived signed photo URL is allowed by the storage contract.

### P0-21 | Fit the required viewports and survive map tile failure

1. Open the citizen view at 390 px wide.
2. Open the officer view at 1366 px wide.
3. Block map tile requests and inspect both views.

**Pass when:**

- Neither view has horizontal page overflow at its required width.
- The report sheet, queue, selected report, and action controls remain usable.
- A readable report-list fallback appears when map tiles fail.
- Reporting, triage, and status refresh remain available during tile failure.

### P0-22 | Verify the actual build and deployed HTTPS report link

1. Run the repository's production build command.
2. Deploy that build to an HTTPS URL.
3. Open the deployed URL in fresh phone and laptop browser sessions.
4. Create a report and open its `/reports/[id]` link from both devices.

**Pass when:**

- The production build completes successfully.
- The phone and laptop open the same deployed HTTPS origin.
- The report link opens the saved report, photo, and shared status after refresh on
  both devices.
- The flow does not require a localhost server, an in-memory list, or browser-local
  storage.

## Optional P1 scenario

### P1-3D-01 | Keep the map useful when 3D is available or unavailable

1. On a supported device, open the selected report and enable the tilted map with
   3D buildings.
2. Pan, zoom, select the report, and inspect the impact overlay.
3. Repeat on a device or browser where 3D building data is unavailable.

**Pass when:**

- The tilted view and 3D buildings help locate the selected report when the data is
  available.
- The map, report selection, and impact overlay remain usable in 2D.
- Missing 3D data does not block reporting, triage, status refresh, or municipal
  preview.

A candidate build meets the core acceptance bar when all P0 scenarios pass. The
`P1-3D-01` scenario is optional and may remain unimplemented when the 2D map works.
