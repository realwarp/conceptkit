# ConceptKit

**AI Creative Director** — turn one text prompt into a complete creative system.

One prompt in → brand summary, mood keywords, colour palette, typography pairing, brand voice, and a cinematic hero reference image.

Built for the [IBM AI Builders Challenge](https://ibm.biz/ai-builders-challenge) · July 2026. Built with IBM Bob's Plan and Code modes.

---

## What it does

1. You type a concept — e.g. *"Cozy Scandinavian interior design studio, warm oak and linen"*
2. **Stage 1 (Creative Strategy):** Llama 3.3 70B reasons about the concept and produces a full creative brief: category, summary, audience, brand personality, mood keywords, visual language, palette mood, and typography mood.
3. **Stage 2 (Design System):** A second LLM call consumes the strategy and translates it into exact HEX palette values, a real Google Font pairing, and a cinematic image prompt.
4. **Hero image:** A Pollinations.ai URL is constructed from the image prompt — no image API calls, no polling.
5. The result is rendered in a structured layout and saved to the filesystem for sharing.

ConceptKit is **not** an AI image generator. The image is one supporting reference for the creative direction.

---

## Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 14.2.35 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + framer-motion |
| LLM | Llama 3.3 70B via [HuggingFace router](https://router.huggingface.co) |
| Image | [Pollinations.ai](https://pollinations.ai) URL API (`model=flux`, 1280×720) |
| Storage | Filesystem JSON (`.next/cache/conceptkit/` dev, `/tmp/conceptkit/` prod) |
| Hosting | Vercel |

No database. No auth. No paid image API.

---

## Deploy to Vercel

### 1. Fork / clone

```bash
git clone https://github.com/your-username/conceptkit.git
cd conceptkit
```

### 2. Set environment variable

In the Vercel dashboard → Project → Settings → Environment Variables, add:

| Key | Value |
|---|---|
| `HF_API_KEY` | Your HuggingFace token (`hf_…`) |

Get a free token at [huggingface.co/settings/tokens](https://huggingface.co/settings/tokens). The free tier is sufficient.

### 3. Deploy

```bash
npx vercel --prod
```

Or connect the repo to Vercel for automatic deploys on push.

> **Note:** The route uses `maxDuration: 60` to accommodate two sequential LLM calls (~10–15s each). Make sure your Vercel plan supports 60-second function timeouts (Hobby plan supports up to 60s).

---

## Run locally

```bash
npm install
```

Create `.env.local`:

```env
HF_API_KEY=hf_xxxxxxxxxxxxxxxxxxxx
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## API

### `POST /api/generate`

**Request:**
```json
{ "prompt": "A noir detective film set in 1960s Tokyo" }
```

**Response:**
```json
{
  "id": "abc1234567",
  "createdAt": "2026-07-01T00:00:00.000Z",
  "prompt": "A noir detective film set in 1960s Tokyo",
  "summary": "Rain-slicked streets meet obsession. Tokyo's shadows never forgave.",
  "brandPersonality": ["brooding", "precise", "haunting"],
  "audience": "Cinephiles and noir fiction readers",
  "moodKeywords": ["nocturnal", "rain-soaked", "tense", "filmic", "precise"],
  "visualLanguage": "...",
  "palette": [
    { "role": "primary",    "hex": "#1A1A2E" },
    { "role": "secondary",  "hex": "#E94560" },
    { "role": "accent",     "hex": "#F5A623" },
    { "role": "neutral",    "hex": "#A8A8B8" },
    { "role": "background", "hex": "#0A0A12" }
  ],
  "typography": {
    "heading": "Bebas Neue",
    "body": "Source Sans 3",
    "rationale": "Cinematic weight contrast meets systematic clarity."
  },
  "voice": "...",
  "referenceImages": [
    { "id": "abc12345", "prompt": "...", "url": "https://image.pollinations.ai/..." }
  ]
}
```

**Validation:**
- `prompt` required, max 500 characters
- Palette hex values regex-validated; defaults applied on failure
- Each LLM stage retries once on parse failure

### `GET /c/[id]`

Renders a read-only shareable view of a saved concept. Concepts are persisted to the filesystem on generation.

### `GET /api/image-proxy?url=<encoded>`

Server-side proxy for Pollinations images — used by the PNG export to avoid canvas CORS tainting.

---

## Project structure

```
app/
  api/
    generate/route.ts      ← Two-stage LLM pipeline
    image-proxy/route.ts   ← CORS proxy for PNG export
  c/[id]/page.tsx          ← Share page
  globals.css
  layout.tsx
  page.tsx                 ← Main UI
components/
  ConceptForm.tsx
  ConceptResult.tsx        ← Result layout (summary → hero → palette → cards)
  EmptyState.tsx
  ErrorState.tsx
  LoadingSkeleton.tsx      ← Phase-based loading skeleton
lib/
  prompts/
    creativeStrategy.ts    ← Stage 1 prompt + type
    designSystem.ts        ← Stage 2 prompt + type
  store.ts                 ← Filesystem concept store
  types.ts                 ← Shared types
```

---

## Notes

- Concept store persists across requests on Vercel (filesystem under `/tmp`) but resets on cold starts. This is intentional for a hackathon scope.
- The two-stage pipeline produces significantly better palettes and font choices than a single LLM call because the design system stage has full strategic context.
- Total generation time is typically 20–35 seconds (two LLM calls + Pollinations image loads asynchronously in the browser).
