#!/usr/bin/env python3
"""Search verified HRM open-data layers.

Usage:  find.py <terms...> [-n N]
Only returns layers confirmed publicly queryable (no token).
"""
import json, sys, os

def main():
    args = sys.argv[1:]
    n = 15
    if "-n" in args:
        i = args.index("-n"); n = int(args[i + 1]); args = args[:i] + args[i + 2:]
    if not args:
        print(__doc__); return 1
    terms = [t.lower() for t in " ".join(args).split()]
    cat = json.load(open(os.path.join(os.path.dirname(__file__), "..", "catalog.json")))
    hits = []
    for r in cat["public"]:
        title = (r["title"] or "").lower(); svc = r["service"].lower().replace("_", " ")
        hay = " ".join([title, svc, r.get("desc", ""), " ".join(r.get("keywords", []))]).lower()
        score = sum((3 if t in title or t in svc else 1) for t in terms if t in hay)
        if score: hits.append((score, r["rows"], r))
    if not hits:
        print(f"No public layer matches {' '.join(terms)!r}. Try broader terms."); return 1
    hits.sort(key=lambda x: (-x[0], -x[1]))
    for _, _, r in hits[:n]:
        print(f"\n{r['title']}  [{r['rows']:,} rows]")
        if r.get("desc"): print(f"  {r['desc'][:140].strip()}")
        print(f"  {r['url']}")
    print(f"\n{len(hits)} match(es); showing {min(n, len(hits))}.")
    return 0

sys.exit(main())
