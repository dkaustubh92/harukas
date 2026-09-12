# Problem-statement research

One file per challenge we seriously evaluate: `01-reporting.md`, `02-parking.md`,
`03-trees.md`, `04-beach.md`, `05-crane.md`. Only create the ones we actually look at.

**Hard cap: 15 minutes** for this whole block (`../01-hackathon/runbook.md`). Research is
for eliminating options, not for becoming an expert.

## What each file needs

| Section | Why |
|---|---|
| **Who is the Monday person** | The double-weighted criterion. Name the specific human and what their Monday looks like. If you can't, the challenge scores 0 on 40% of the rubric |
| **Data — verified or not** | A **gate, not a score.** Run `python3 .claude/skills/halifax-data/scripts/find.py <terms>`. Paste the real FeatureServer URL and a row count. Never a guessed URL |
| **The non-obvious insight** | Something true that isn't on the challenge slide. If our take is on the "three most obvious builds" list, it scores 0 on Idea |
| **90-second demo shape** | Can a judge see the problem and the outcome? If you can't sketch it in two sentences, it isn't demoable |
| **Verdict** | Pursue / kill, and the reason in one line |

Kill fast. Four teams per problem and the board fills first-come — time spent here is time
not spent claiming.

## Research after selection

[Tree data sources and implementation limits](03-trees-data-sources.md) reviews the
teammate's eight source leads, census joins, diameter codes, and remaining data gaps.
