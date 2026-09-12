# Design QA

Source target: Harbour map mockup at `/Users/dkaustubh/.codex/generated_images/01a0963e-9264-75d3-8cf3-0e10d1eb6df5/exec-d9b6acd0-3587-4379-9b5e-b54b8d2f0b76.png`.

Implementation: `http://localhost:3000/staff`, inspected in the Codex in-app browser. The matching comparison used a 1440 by 1024 CSS viewport. The current demo state selected citizen report `DEMO-027` after a simulated response.

## Findings and fixes

- P1, evidence panel action visibility. The first implementation placed all officer actions below several evidence sections, so the primary action was not visible in the initial laptop viewport. Added a full-width context-aware action below the report location. It shows `Mark reviewed` for a new report and `Simulate response assignment` after review.
- P1, citizen-report provenance in the queue. The first implementation labelled every demo report as seeded because it checked `isDemo`. Updated the label to use `source`, so submitted citizen records show `Citizen report` while fixtures remain `Seeded`.
- P3, map fidelity. The implementation uses a locally rendered, approximate Halifax location diagram instead of the detailed street-map texture in the concept. This is an intentional deadline tradeoff. The panel keeps the concept's dominant spatial hierarchy, linked selection, source note, legend, and staff-only illustrative scenario. It does not claim to be a closure map.
- P3, queue density. The implementation adds three compact counts and search to help the presenter find the newest report in a 25-record demo. These controls are denser than the reference but remain inside the same continuous queue surface.

## Required fidelity surfaces

- Fonts and typography: Geist is used throughout. The heading, label, and body hierarchy matches the reference's restrained sans-serif treatment. Text stays readable at the required desktop size.
- Spacing and layout rhythm: the 64-pixel header and continuous queue, map, and evidence columns match the source hierarchy. Thin dividers separate the columns. The map remains the largest region.
- Colors and visual tokens: warm white, forest green, sage, and pale blue-grey match the selected concept. Priority colors are restrained and always paired with text.
- Image quality and assets: each seeded report now resolves to a distinct attributed representative image. Citizen uploads use the server-normalized image route. The UI labels representative images so they are not mistaken for verified location evidence.
- Copy and content: demo labels, uncertainty, human review, and `No crew was dispatched` are explicit. The UI contains no risk score, ETA, or official-closure claim.

The browser pass confirmed queue selection, the primary staff action, version update, event history, and the updated citizen status. No actionable P0, P1, or P2 visual differences remain for the time-boxed demo.

final result: passed
