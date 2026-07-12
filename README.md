# ConceptKit

> Your AI creative director. Turn a single idea into a full visual concept in seconds.

**Built for the [IBM AI Builders Challenge](https://www.bemyapp.com/) — July 2026 Challenge: Reimagine Creative Industries with AI**

---

## What it does

ConceptKit is an AI creative director for designers, filmmakers, art directors, and brand teams. Give it a brief — *one sentence* — and it returns a complete visual concept: a **strategy**, a **design system** (colors, typography, mood), and **hero imagery**.

No more staring at a blank moodboard for hours. No more expensive moodboard tools. No more generic AI images that don't match your idea.

## Demo

**Live:** [conceptkit.vercel.app](https://conceptkit.vercel.app) *(link after deploy)*

![ConceptKit Screenshot](docs/screenshot.png)

## Built with IBM Bob

ConceptKit was developed end-to-end with **IBM Bob** as the primary development tool — from initial scaffolding and prompt engineering to UI components and the generation pipeline. Bob handled spec-driven development, code generation across the entire Next.js codebase, and iteration on the design system logic.

**Required learning completed:** [IBM SkillsBuild — How IBM Bob and AI Tools Are Changing the Way Solutions Are Built](#) *(certificate on file)*

## The problem

Creative professionals spend hours — sometimes days — building initial concept boards. Existing tools either:

- Require you to *already know* the visual language (Figma, Adobe)
- Generate generic images that miss the brief (stock photo sites)
- Need expensive monthly subscriptions (Miro, Milanote)

AI image generators can produce visuals, but they don't think like a creative director. They don't tell you *why* certain colors work, *what typography* matches the mood, or *how* to apply the system across a campaign.

## The solution

ConceptKit combines a **language model** with **structured design thinking**:

1. **Creative Strategy** — A senior strategist's brief. Concept, tone, audience, narrative angle.
2. **Design System** — A complete palette (5 colors with roles), typography pairing, motion language, do/don't rules.
3. **Hero Imagery** — Three AI-generated images that embody the concept.

The result: a shareable, opinionated creative concept you can hand to a designer, pitch to a client, or use as a starting point.

## AI approach & architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        User Input                            │
│              "Cyberpunk ramen bar in Tokyo"                  │
└──────────────────────────┬───────────────────────────────────┘
                           │
                           ▼
┌──────────────────────────────────────────────────────────────┐
│                  Next.js API Route                           │
│                  /api/generate                               │
└──────┬───────────────────────────────────┬───────────────────┘
       │                                   │
       │  Strategy & Design System         │  Image Prompts
       ▼                                   ▼
┌──────────────────────┐         ┌──────────────────────────┐
│   LLM (Granite 3B)   │         │  Pollinations.ai         │
│   via HF Inference   │         │  (FLUX image gen)        │
│                      │         │                          │
│   Structured JSON    │         │  3 hero images           │
│   with strict schema │         │  per concept             │
└──────┬───────────────┘         └──────────┬───────────────┘
       │                                   │
       └──────────────┬────────────────────┘
                      ▼
         ┌────────────────────────────┐
         │   Unified Concept JSON     │
         │   Rendered to moodboard    │
         └────────────┬───────────────┘
                      │
                      ▼
            ┌──────────────────┐
            │  Shareable Page  │
            │  /c/[id]         │
            └──────────────────┘
```

### Key design decisions

- **Two-pass generation** — strategy first, then design system that *references* the strategy. This produces more coherent results than one-shot prompts.
- **Structured output enforcement** — strict JSON schema with retries on parse failure. No `null` fields shipped to the UI.
- **Free-tier friendly** — runs on Hugging Face Inference (Llama 3.3 70B) + Pollinations.ai. No paid API keys required.
- **Client-rendered moodboard** — the shareable `/c/[id]` page works without server-side state, so judges can click any concept URL and see the full board.

## Tech stack

| Layer | Technology |
|---|---|
| **Framework** | Next.js 14 (App Router) |
| **UI** | React, Tailwind CSS, Lucide icons |
| **Language Model** | Llama 3.3 70B (Hugging Face Inference) |
| **Image Generation** | Pollinations.ai (FLUX) |
| **Storage** | Browser localStorage (concepts persist client-side) |
| **Deployment** | Vercel |
| **Primary Dev Tool** | **IBM Bob** |

## Selected challenge theme

**July Challenge: Reimagine Creative Industries with AI**

ConceptKit directly addresses every "Think About" prompt in the challenge brief:

- ✅ **AI enhances creativity** — acts as a creative partner, not just a generator
- ✅ **AI helps people create faster** — concept in 8 seconds vs. 8 hours
- ✅ **AI unlocks new creative experiences** — the strategy layer is something no other tool does
- ✅ **Bridges the gap between imagination and execution** — outputs are opinionated, ready to use
- ✅ **AI as a creative partner** — explains *why* each design choice was made

## How IBM Bob was used

Bob was the primary development tool across the entire build:

- **Scaffolding** — generated the Next.js project structure, API routes, and Tailwind config
- **Component generation** — built the React components (ConceptForm, ConceptResult, EmptyState, LoadingSkeleton) with spec-driven prompts
- **Prompt engineering** — iterated on the LLM system prompts (`lib/prompts/creativeStrategy.ts`, `lib/prompts/designSystem.ts`) to enforce the strict JSON schema
- **Debugging** — fixed type errors, hydration issues, and edge cases in the rendering pipeline
- **Documentation** — wrote the architecture docs and the README

The full commit history shows Bob-driven development from initial scaffold to final polish.

## Run locally

```bash
git clone https://github.com/realwarp/conceptkit.git
cd conceptkit
npm install
cp .env.example .env.local   # add your HF_API_KEY (free at huggingface.co)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Submission

- **Challenge:** July 2026 — Reimagine Creative Industries with AI
- **Team:** Solo
- **Demo video:** [link to be added]
- **SkillsBuild certificate:** [on file, uploaded to submission platform]
- **Submitted via:** [BeMyApp platform link]

## License

MIT
