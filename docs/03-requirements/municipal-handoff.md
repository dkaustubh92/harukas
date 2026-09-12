# Municipal request handoff

**Added: 12 Sep 2026, 11:21 ADT. Status: prototype requirement, not implemented.**

HaruKas prepares a municipal tree request with a short overview and a link to the
full report on our platform. The intended production destination is Halifax's
existing service-request system through its [Trees form](https://www.halifax.ca/home/online-services/trees).
This connects citizen reporting to the city's intake process.

## Prototype constraint

**The prototype must never send a real request to Halifax.** This is an explicit
user requirement. It applies to demos, development, and verification.

- Simulate the handoff entirely inside HaruKas. Do not fill, upload to, or submit
  the live municipal form with report data.
- Ship only the simulated submission path. A setting or environment variable must
  not enable a live submission path in the prototype.
- Show **Demo only. Not sent to Halifax.** on the preview and simulated receipt.
- Use a visibly simulated reference such as `DEMO-001`. Do not present it as an
  official request number or claim that Halifax received or saved the report.

## Demo flow

1. Open a report in HaruKas. A seeded report is enough for this flow.
2. Generate an intake preview with contact fields, location, and a short overview.
3. Include the report URL in the overview and show the remaining character count.
4. Let the user review the preview, then choose **Simulate municipal submission**.
5. Display a simulated receipt linked to the HaruKas report.

The overview states the observed issue and relevant triage context. It must not
claim that a tree will fall. The full report holds the supporting evidence and
uncertainty that will not fit in the municipal field.

## Verified form constraints

Inspected the rendered official page and its form attributes in a browser on
12 Sep 2026. No data was entered and no request was submitted.

| Field | Observed constraint |
|---|---|
| First name, last name | Required, 25 and 50 characters respectively |
| Email, phone | Required, 75 and 128 characters respectively |
| Street address | Required, 128 characters |
| Unit or apartment | Optional, 10 characters |
| Approximate location | Optional, 250 characters |
| Details of request | Required, 500 characters, including the overview and report URL |
| Attachment | Optional, one file, up to 2 MB; image formats or PDF |

The page displays reCAPTCHA. Automatic submission, acceptance of report links,
confirmation responses, and backend persistence have not been tested. Viewing the
form does not prove a supported API or direct database access.

A future live integration needs a verified submission method and a real municipal
acknowledgement before showing an official request number. That work is outside
the prototype. The report link must let officials read the relevant evidence
without exposing the reporter's private contact details.
