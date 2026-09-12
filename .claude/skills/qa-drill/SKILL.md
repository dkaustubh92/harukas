---
name: qa-drill
description: Prepare for judge questions after the demo. Use from 13:00 once the build is stable. Triggers - "what will judges ask", "Q&A", "hard questions", "how do we answer", "prep questions".
---

# Judge Q&A

The 2 minutes after the demo sink teams that nailed the demo. Prepare answers; don't improvise under pressure.

## The questions that actually come

**Technical**
- "What's Claude actually doing here — couldn't you do this with a database query?" → the honest answer is where judgement is needed vs. deterministic logic (`senior-ai-developer`)
- "What happens if the model is wrong?"
- "Is this real data or mocked?" → **always answer honestly.** Say "we cached these three responses for demo reliability; it's live otherwise" — that reads as professional, not evasive
- "How does this scale?"

**Product**
- "Who pays for this?"
- "Why hasn't the city built it?"
- "Who's your user — residents or staff?" → have a primary, not both
- "What's the adoption path?"

**Impact**
- "Where does that number come from?" → **be ready to show the query live.** Best available scoring moment
- "How many people does this actually reach?"
- "What about people without smartphones?" → civic tech; equity questions are certain

**Hostile**
- "Isn't this just a wrapper around Claude?"
- "You built this in four hours — what's missing?" → name real gaps confidently; false completeness reads worse than honest scope
- "How is this different from [existing thing]?"

## Answering rules

- **Answer in one sentence, then stop.** Rambling converts a good answer into a bad one
- **"We don't know yet, but here's how we'd find out"** is a strong answer. Bluffing is not
- **Name your limitations before they do.** It reads as rigour
- **Never argue with a judge.** "That's fair — here's how we'd address it"
- **Redirect to strength** once, not repeatedly

## Prep protocol

1. HA writes the 10 most likely questions given *this* project
2. KD answers each in one sentence
3. HA attacks the three weakest answers
4. Rewrite those three
5. Decide who fields what — **technical to KD, product and impact to HA**

Do this at 14:30, after the freeze, with the real demo in front of you.
