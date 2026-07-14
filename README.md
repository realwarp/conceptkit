# ConceptKit

> Your creative system, in seconds.

ConceptKit is an AI creative director that turns a single one-line brief into a complete brand direction: mood, audience, color palette, typography pairing, brand voice, and a cinematic reference image — all exportable as PNG and shareable as a link.

Built for the **IBM AI Builders Challenge · July 2026** (Theme: *Reimagine Creative Industries with AI*).

---

## Why it exists

The first 30 minutes of any creative project are the worst. Open Figma, scroll Pinterest, second-guess the mood, pick a hex from a saved swatch, change it, repeat. By the time you start building, you've lost the energy.

ConceptKit collapses that 30 minutes into **one prompt and a 10-second wait**. You walk away with a coherent direction — not inspiration, a direction you can actually build from.

---

## What it does

Drop in a one-liner like `Noir detective film set in 1960s Tokyo, rain-soaked neon`. ConceptKit returns:

| Output | Detail |
| --- | --- |
| **Brand summary** | A 1–2 sentence distillation of the concept. |
| **Mood keywords** | 3–5 chips (e.g. *Gritty · Sophisticated · Mysterious*). |
| **Personality** | 3–4 traits (`Gritty`, `Sophisticated`, `Mysterious`…). |
| **Audience** | One-line description of who this is for. |
| **Color palette** | 5 hex codes with semantic roles (primary, secondary, accent, neutral, background) + per-color rationale. Click-to-copy. |
| **Typography** | Heading + body Google Font pair with rationale + pairing logic. |
| **Brand voice** | A 1–2 sentence stylistic directive (rendered in the heading font). |
| **Visual language** | Free-form prose on visual treatment, composition, mood. |
| **Hero image** | A cinematic reference image, generated to match the brief, with retry-on-fail. |
| **Export PNG** | A pixel-2x rendered board of the whole direction, ready to drop into a deck. |
| **Share link** | URL-encoded concept — no DB, no login, just a link. |

---

## How it works (architecture)

```
┌──────────────┐         ┌──────────────────┐
│  Next.js UI  │  POST   │ /api/generate    │
│  /app/page   │────────▶│  (Node runtime)  │
└──────────────┘         └────────┬─────────┘
                                 │
                  ┌──────────────┴──────────────┐
                  ▼                             ▼
        ┌──────────────────┐         ┌──────────────────┐
        │  STAGE 1:        │         │  STAGE 2:        │
        │  Creative        │ ──────▶ │  Design System   │
        │  Strategy        │ context │  (palette +      │
        │  (LLM call 1)    │         │   typography)    │
        └──────────────────┘         └────────┬─────────┘
                                              │
                                              ▼
                                    ┌────────────────────┐
                                    │  Image generation  │
                                    │  (parallel,        │
                                    │   retry-on-fail)   │
                                    └────────┬───────────┘
                                             ▼
                                    ┌────────────────────┐
                                    │  Validation +      │
                                    │  Sanitization      │
                                    │  (zod + hex check)  │
                                    └────────┬───────────┘
                                             ▼
                                    ┌────────────────────┐
                                    │  Share encoding    │
                                    │  (lz-string +      │
                                    │   URL state)       │
                                    └────────────────────┘
```

### Why a 2-stage LLM pipeline?

A single-prompt design ask usually fails at one of two things: the colors don't match the concept, or the typography doesn't match the colors. The fix is to **separate strategy from execution**.

**Stage 1 — Creative Strategy** (`lib/prompts/creativeStrategy.ts`)
The LLM only reasons about *what the concept wants*. No hex codes, no font names — just mood, narrative, audience, visual intent. Output is a strategic foundation that a human creative director would have produced in a 30-min brainstorm.

**Stage 2 — Design System** (`lib/prompts/designSystem.ts`)
The Stage 1 strategy is injected as context. Only now does the LLM pick palette + typography — and it picks them *based on a defined strategy*, not vibes. Output is constrained to real hex codes and real Google Font names.

Each stage validates its own output. Bad palette → retry. Unmappable fonts → retry. The result is a direction that holds together.

### Image proxy (`/api/image-proxy`)

Reference images are external URLs (FLUX). For PNG export via `html-to-image`, the canvas would taint on cross-origin. The proxy fetches upstream, sets `Access-Control-Allow-Origin: *`, and serves a 24h-cached version. Export works every time, no CORS error.

### Share links (`lib/share.ts`)

The whole concept is lz-string-compressed and base64-encoded into the URL. **`/c/<id>` doesn't hit the filesystem** — it decodes the URL state. No database, no auth, no expiry. Works offline once loaded.

### Validation + sanitization

- Hex codes are regex-validated. Bad ones get a deterministic fallback.
- Font families are checked against a whitelist of Google Fonts. Unknown names get a sane default.
- Color roles are always emitted in a stable order: primary, secondary, accent, neutral, background.

### UI state machine

Four states, no surprises: `idle → loading → success | error`. Each state has its own component (`EmptyState`, `LoadingSkeleton`, `ConceptResult`, `ErrorState`). No half-broken intermediate renders.

---

## Stack

- **Next.js 14** (App Router, Node runtime for routes)
- **TypeScript 5.5** (strict)
- **Tailwind 3.4** + custom design tokens
- **Framer Motion 12** — staggered fade-up reveals on the result card
- **lucide-react** — icon set
- **html-to-image** — DOM-to-PNG export
- **nanoid** — concept IDs
- **lz-string** — URL-state compression for share links

No client state library. No router library. No design system package. The whole UI is plain React + Tailwind.

---

## Repo layout

```
conceptkit/
├── app/
│   ├── page.tsx               # Home: form + result + sample prompts
│   ├── c/[id]/page.tsx        # Read-only shared view (decodes URL state)
│   ├── api/
│   │   ├── generate/route.ts  # POST: 2-stage LLM + image generation
│   │   └── image-proxy/route.ts  # GET: CORS proxy for export
│   ├── globals.css            # Tokens + component classes
│   └── layout.tsx
├── components/
│   ├── ConceptForm.tsx        # Prompt input + submit
│   ├── ConceptResult.tsx      # The whole result board (export target)
│   ├── EmptyState.tsx         # Sample prompts
│   ├── LoadingSkeleton.tsx    # Loading state
│   └── ErrorState.tsx         # Error + retry
├── lib/
│   ├── types.ts               # ConceptResult, Color, Typography, …
│   ├── share.ts               # lz-string encode/decode for /c/[id]
│   ├── store.ts               # Optional server-side concept persistence
│   └── prompts/
│       ├── creativeStrategy.ts  # Stage 1 prompt
│       └── designSystem.ts      # Stage 2 prompt + types
├── tailwind.config.ts
├── next.config.mjs
├── tsconfig.json
└── package.json
```

---

## Run it locally

```bash
# 1. Install
npm install

# 2. Set up env
#    Create .env.local with your model provider keys.
#    See "Environment" below for the exact variable names.

# 3. Dev server
npm run dev          # http://localhost:3000

# 4. Production build
npm run build
npm start
```

### Environment

| Var | What it does |
| --- | --- |
| `LLM_API_KEY` | Stage 1 + Stage 2 model API key. |
| `LLM_MODEL` | (Optional) Model name. Defaults to a fast, instruction-following model. |
| `IMAGE_API_KEY` | Image-generation provider key. |
| `IMAGE_MODEL` | (Optional) Defaults to a cinematic image model. |

ConceptKit is model-agnostic on purpose — both LLM and image stages accept any provider that can hit the prompts. Pick the cheapest combination that hits the quality bar.

---

## Key design decisions

- **2 stages, not 1.** A single-prompt design ask fails at coherence. Separating strategy from execution is the only way to get a direction that *holds together*.
- **No DB.** Share links are URL state. The whole thing works on a serverless deploy with zero persistence.
- **No client state library.** Four states. One `useState` machine. Done.
- **Result card is a single export target.** One `ref`, one `toPng()` call, the whole board downloads at 2x.
- **Image retry on the client.** FLUX is slow and occasionally times out. Three retries with exponential backoff, then a graceful "image unavailable" fallback that still shows the prompt.
- **Color roles, not just hex codes.** A palette is *primary, secondary, accent, neutral, background* — not a bag of pretty colors. The role names make the palette reusable in Figma without translation.
- **Type-safe end-to-end.** The API returns exactly `ConceptResult`. The component consumes exactly `ConceptResult`. No `any`, no `Record<string, unknown>` leaks.

---

## What I learned building it

1. **Most "AI design tools" give you a vibe. ConceptKit gives you a direction.** The difference is that a direction has structure — palette roles, font rationale, voice, audience — not just colors and a logo.
2. **Stage separation is the whole game.** A single LLM call that tries to do strategy + design in one shot will always be incoherent. Two calls, one focused on each, produces something you'd actually use.
3. **DOM-to-PNG is way easier than canvas-from-scratch.** If your export target is the actual rendered UI, you get fonts, gradients, and responsive layout for free. The only gotcha is CORS, which is what the proxy is for.
4. **URL state is underrated.** `/c/<id>` with lz-string-encoded state means no DB, no auth, no expiry, and the link works in any chat app. The same trick scales to everything from blog posts to bug reports.

---

## License

MIT.

## Credits

Built by Ashwin Shelke for the [IBM AI Builders Challenge](https://ibm.biz/ai-builders-challenge), July 2026.

- IBM Bob — primary AI dev tool (per challenge requirement)
- IBM SkillsBuild — required learning activity completion
- IBM Granite + watsonx — recommended technologies
