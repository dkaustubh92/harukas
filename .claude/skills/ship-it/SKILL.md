---
name: ship-it
description: Deploy the prototype to Vercel and verify it works in production. Use for the first deploy at 10:15 and every push after. Triggers - "deploy", "ship", "push to prod", "vercel", "is it live", "env vars".
---

# Ship it

> **Deploy at 10:15, before the app does anything.** Not at 14:00. The most common hackathon failure is discovering at 2pm that env vars don't work in production.

## First deploy — target 10:15

1. Scaffold exists, commits to `main`
2. Push to `dkaustubh92/harukas`
3. Import the repo at **vercel.com/new** — this is a one-time manual step in the browser
4. Add env vars in the Vercel dashboard **before** the first build:
   - `ANTHROPIC_API_KEY`
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY` (server-only — never `NEXT_PUBLIC_`)
5. Deploy, then **open the live URL and confirm it renders**

After this, every push to `main` auto-deploys. HA works from this URL (`two-lane`).

## Smoke test — run after every deploy

Not "did the build pass" — **does the thing work in production?**

- [ ] Live URL loads, no blank screen
- [ ] One Claude call completes end-to-end in prod
- [ ] Supabase read returns data in prod
- [ ] No secrets in the client bundle — check DevTools → Sources
- [ ] Works in a fresh incognito window (no cached local state)

## Env var rules

- `NEXT_PUBLIC_*` is **visible in the browser bundle.** The Anthropic key is never `NEXT_PUBLIC_` — API calls go through a server route
- Adding an env var requires a **redeploy** to take effect
- `.env.local` stays gitignored; production values live only in the Vercel dashboard

## Failure playbook

| Symptom | Usual cause |
|---|---|
| Build passes, page is blank | Client-side exception — check the browser console, not the build log |
| Works local, 500 in prod | Missing env var, or a Node API used in an edge runtime |
| Env var "not picked up" | Added after the build — redeploy |
| Claude call 401s in prod | Key not set in Vercel, or the route is running client-side |

## The 14:00 freeze

**Stop deploying at 14:00** (`demo-safe`). Whatever is live then is what you demo. Keep localhost running as a fallback.
