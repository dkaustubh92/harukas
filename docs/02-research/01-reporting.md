# 01 · Reporting What's Wrong — research

**Verdict: PASS.** Not because it's a weak problem — because it's a weak fit for a
double-weighted "could they use it Monday" criterion.

## Why it loses on the rubric

**The obvious build fails the ×2 criterion by construction.** The natural response to
"only one in five reports reaches the city online" is a better reporting channel — voice,
chat, photo, multilingual. That has **zero day-one impact**: it only pays off once residents
find it and change their behaviour. "Could they use it Monday?" has no good answer when the
product needs an adoption curve first.

**The salvageable version is an analytics dashboard.** Join service requests + 311 call
volumes + census to show which neighbourhoods under-report relative to need, so the city
can inspect proactively. That does have a Monday user (a planner), but:

- The outcome is diffuse — hard to make "the problem and the outcome obvious" in 3 minutes
- A map of under-reporting is a finding, not a tool, so it's weak on *Product. Is it usable?*
- It is the most-expected build on the most-expected challenge

**Crowding.** This is the first challenge on the board and the easiest to have an opinion
about. Assume all four slots go early.

## Data (it is there — that isn't the problem)

```
Cityworks_Service_Requests      477,343 rows  — lat/lon, COMMUNITY, DISTRICT, dates
311_Call_Details              4,961,240 rows  — call reason by department
311_Call_Volumes                147,983 rows  — 30-min increments, offered/handled/abandoned
```
Plus census. Data availability passes the gate cleanly. The rubric fit is what fails.

## If we were forced back here

The strongest angle would be the **abandoned-call** field in `311_Call_Volumes` — people who
tried to reach the city and gave up. That is a concrete, countable population of
"who the city never hears from," and it's a harder number to argue with than a census proxy.
Worth remembering if trees collapses.
