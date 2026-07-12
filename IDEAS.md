# Ideas Bank — ConceptKit

Stuff to build, stuff to skip, stuff to maybe add later. Keep this messy — it's a scratchpad.

---

## Core Features (MUST have for submission)

- [ ] Text input: "Describe your project's vibe"
- [ ] Generate: color palette (5 hex codes, labeled)
- [ ] Generate: typography pairing (heading + body, with Google Fonts link)
- [ ] Generate: 4 reference images (AI-generated)
- [ ] Generate: brand voice (3 sentences)
- [ ] Shareable link (view-only, no auth)

## Nice-to-have (only if time)

- [ ] Download as PNG
- [ ] Edit individual colors after generation
- [ ] "Regenerate just the images" button

## Probably skip (out of scope for MVP)

- Multi-user accounts
- Team collaboration / commenting
- Payment / subscriptions
- Image uploads from user
- Mobile app

---

## Feature Brainstorm

### 1. Color Palette Generation
**Approach:** Ask llm to return 5 hex codes with semantic labels.
**Prompt trick:** Include examples of good palettes in the prompt (few-shot).
**Validation:** Regex check for hex format, fall back to a default palette if invalid.

### 2. Typography Pairing
**Approach:** llm returns `{ heading: "Playfair Display", body: "Inter", rationale: "..." }`.
**Validation:** Cross-check against Google Fonts API to ensure fonts exist.
**Display:** Show font name + sample text rendered in the font (Google Fonts embed).

### 3. Reference Images
**Approach:** Use the user's prompt + LLM-extracted "visual keywords" as input to Pollinations.ai
**Options:**
  - **Replicate** — pay-as-you-go, ~$0.002 per image, but need credit card
  - **Hugging Face Inference API** — free tier, rate-limited (good for MVP)
  - **Pollinations.ai** — free, no API key, decent quality
**Recommendation:** Start with Pollinations (no signup), upgrade to Replicate if quality is bad.

### 4. Brand Voice
**Approach:** llm returns 3 sentences describing tone, vocabulary, audience.
**Example output:** "Confident but not arrogant. Speaks to indie founders who are tired of corporate jargon. Uses short, punchy sentences."

### 5. Shareable Links
**Approach:** Generate nanoid on creation, store moodboard in memory or Vercel KV.
**View page:** /c/[id] — read-only, no edit, no auth.
**Expiration:** MVP can store forever (small data). Add 30-day expiry later if needed.

---

## Open Questions

- **Do we need a backend DB?**
  - For MVP, no. In-memory dict + Vercel serverless functions work for demos.
  - For real launch, yes — but not in scope.

- **How to handle long prompts?**
  - Cap at 500 chars. Long prompts = bad moodboards anyway.

- **What if user submits garbage?**
  - llm handles context well. Add a profanity filter (just block common slurs).

- **Solo or team?**
  - Solo is faster, but team = more reach in judging.
  - Try Discord #team-formation on Jul 9. If no good fit by Jul 12, go solo.

---

## Design Notes

### Visual style
- **Vibe:** minimal, editorial, "Linear meets Pinterest"
- **Color scheme:** off-white background, dark text, one accent color (orange? or derived from generated palette? meta.)
- **Typography:** Use Inter (system) for UI, generated fonts for moodboards
- **Animations:** Subtle fade-in on moodboard render, no over-the-top stuff

### Layout
- **Landing:** centered input, big "Generate" button, examples below
- **Output:** vertical stack — colors, typography, images, voice, share button
- **View page:** same as output, no input form, just the moodboard

---

## Inspiration / References

- **BrandBird** — moodboard tools for designers
- **Pinterest** — visual reference management
- **Coolors** — color palette generation
- **Galileo AI** — AI design generation (too complex, but good UX)
- **Krea.ai** — AI image generation with style control

---

## What I'd Build Next (Post-Hackathon)

1. User accounts + saved moodboards
2. "Style transfer" — upload a reference image, extract its vibe
3. Export to Figma plugin
4. Team workspaces
5. API for other tools to use

But those are post-deadline. **Focus: ship the MVP, win or learn.**
