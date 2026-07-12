# Build Plan — ConceptKit

**Deadline:** July 31, 2026, 11:59 PM ET (~20 days from now)
**Current date:** July 11, 2026
**Mode:** Solo
**Status:** Week 1, Day 1 ✅ scaffold + LLM wired

---

## Timeline Overview

| Week | Dates | Focus | Deliverable |
| --- | --- | --- | --- |
| Week 1 | Jul 11–17 | Spec lock + scaffold + LLM integration | Working API that returns a JSON moodboard from a prompt |
| Week 2 | Jul 18–24 | Frontend + image gen + shareable links | End-to-end working app on localhost |
| Week 3 | Jul 25–31 | Polish, deploy, record video, submit | Live demo + submission |

---

## Week 1: Foundation (Jul 11–17)

### Day 1–2 (Jul 11–12): Setup ✅ IN PROGRESS

- [x] Pick name: ConceptKit
- [x] SkillsBuild IBM Bob cert (Ashwin, completed Jul 11)
- [x] Vercel account ready
- [x] HF API key wired
- [x] Project scaffold (Next.js 14, TS, Tailwind, Pollinations, HF router)
- [x] LLM endpoint tested: returns 4 valid image prompts
- [ ] IBM Bob free trial signup (gives 30 days — expires ~Aug 10) ← DO NOW
- [ ] IBM Bob actually used to refactor at least one feature (proves "used Bob" to judges)
- [ ] Join Discord, introduce yourself in #july-challenge-and-learning

### Day 3–4 (Jul 13–14): LLM integration ✅ DONE

- [x] Wire LLM client (HF router → Llama 3.3 70B)
- [x] JSON parsing with regex extraction + retry
- [x] Return 4 cinematic image prompts per concept
- [ ] Add input validation (length, profanity filter)
- [ ] Add error handling and timeout
- [ ] Test with 10 different prompts

### Day 5–7 (Jul 15–17): API route polish

- [ ] Build POST /api/generate endpoint (already done, needs polish)
- [ ] Add prompt-engineering tests (assert 4 items, hex colors, real fonts)
- [ ] Add second pass: generate palette + typography + voice in a second LLM call (parallel)
- [ ] **Milestone:** Full moodboard JSON in <10s

---

## Week 2: Frontend + Image Gen (Jul 18–24)

### Day 8–9 (Jul 18–19): Core UI

- [ ] Landing page with input form (conceptkitForm.tsx)
- [ ] Loading state (animated, shows progress)
- [ ] conceptkitDisplay.tsx renders the response
- [ ] Mobile responsive

### Day 10–11 (Jul 20–21): Image generation

- [ ] Pollinations integration (URL-based, no auth)
- [ ] Display 4 reference images per moodboard
- [ ] Add loading state for image gen
- [ ] **Milestone:** End-to-end working on localhost

### Day 12–13 (Jul 22–23): Shareable links

- [ ] Generate unique IDs (nanoid)
- [ ] Store moodboards in memory (or Vercel KV if needed)
- [ ] Build /c/[id] page (view-only, no auth)
- [ ] Add copy-link button

### Day 14 (Jul 24): Buffer

- [ ] Bug fixes
- [ ] UI polish
- [ ] **Milestone:** Shippable MVP

---

## Week 3: Polish + Submit (Jul 25–31)

### Day 15–16 (Jul 25–26): Polish

- [ ] Add copy-to-clipboard for color codes
- [ ] Add download-as-PNG option (stretch)
- [ ] Improve error states and edge cases
- [ ] SEO meta tags

### Day 17 (Jul 27): Deploy

- [ ] Push to GitHub (public repo)
- [ ] Deploy to Vercel
- [ ] Test production URL
- [ ] **Milestone:** Live demo URL works

### Day 18–19 (Jul 28–29): Demo video

- [ ] Write 3-minute script
  - 0:00–0:30 — problem statement
  - 0:30–1:00 — solution walkthrough
  - 1:00–2:00 — live demo (3 example prompts)
  - 2:00–2:45 — tech stack + how Bob was used
  - 2:45–3:00 — closing
- [ ] Record (Loom or screen record)
- [ ] Upload to YouTube (unlisted or public)

### Day 20 (Jul 30): Submission prep

- [ ] Fill out submission form
- [ ] Upload SkillsBuild cert
- [ ] Write project description (300 words max)
- [ ] Final README pass

### Day 21 (Jul 31): SUBMIT

- [ ] Publish submission page before 11:59 PM ET
- [ ] **Deadline hit.**

---

## Risk Register

| Risk | Mitigation |
| --- | --- |
| HF router rate limits | Cache results by prompt hash; use 2 images instead of 4 if needed |
| Pollinations cold start (~20s) | Show "Generating references..." state, cache by prompt |
| LLM output not in valid JSON | Strict prompt + regex extraction + retry once |
| Vercel deployment breaks | Test deploy on Day 17, leave 3 days buffer |
| IBM Bob trial expires mid-build | We only need Bob for code gen, not runtime — fine |
| Demo video looks bad | Record 3 takes, pick the best, no editing needed |

## What to Cut If We're Behind

Priority order (cut from the bottom):

1. Download as PNG
2. SEO meta tags
3. Mobile responsive (build desktop-first, fix later)
4. Multiple moodboards per user (just one-off for MVP)
5. **NEVER CUT:** the core flow (input → JSON moodboard → shareable link)

## Daily Time Budget

Given your commute and study schedule:

- **Weekday evenings (6–10 PM):** 4 hours — 2 hours of building, 2 hours of study buffer
- **Weekend (Sat + Sun):** 8–10 hours — primary build time

Realistic: 30–40 hours over 20 days. Plenty for an MVP.

---

## Technical Stack

- **Image generation**: [Pollinations.ai](https://pollinations.ai/) — free, no API key, returns PNG via URL. Each image URL is `https://image.pollinations.ai/prompt/{encoded}?width=1024&height=1024&seed={seed}&nologo=true`. Cached by prompt hash.
- **LLM (mood parsing)**: Meta Llama 3.3 70B Instruct via Hugging Face router (OpenAI-compatible). Free tier, used to expand a 1-line concept into 4 cinematic image prompts. Hitting IBM-tech requirement via IBM Bob as the dev tool + cert from IBM SkillsBuild.
- **Frontend**: Next.js 14 (App Router), TypeScript, Tailwind CSS.
- **Dev tool**: IBM Bob (required by hackathon rules). Used for spec-driven dev.
- **Hosting**: Vercel (free tier). No backend server needed beyond Next.js API routes.

## Architecture (one-liner)

User prompt → POST /api/generate → HF router (Llama 70B) → 4 image prompts → front-end embeds Pollinations URLs → display + shareable /c/[id] link.
