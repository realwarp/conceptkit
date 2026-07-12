# Architecture — ConceptKit

This document describes the architecture currently implemented in this repository.

## Product Framing

ConceptKit is an AI creative-direction app, not an image-only generator.

The system produces a single structured result object with strategic and visual guidance in this order:

1. Summary
2. Brand Personality
3. Mood Keywords
4. Audience
5. Visual Language
6. Color Palette
7. Typography
8. Reference Images
9. Brand Voice

## Runtime Flow

```text
User prompt
  -> POST /api/generate
  -> Llama 3.3 70B (HF router, one call)
  -> Parse + validate JSON (retry once)
  -> Build 4 Pollinations URLs from image prompts
  -> Compose ConceptResult object
  -> Save in memory Map by id
  -> Return ConceptResult
  -> Render sections in strategy-first order
```

## Main Files

- [app/page.tsx](app/page.tsx): thin client orchestrator (idle/loading/success/error)
- [app/api/generate/route.ts](app/api/generate/route.ts): prompt validation, LLM call, JSON parsing, palette sanitization, image URL generation, save to store
- [app/c/[id]/page.tsx](app/c/%5Bid%5D/page.tsx): read-only shared view
- [components/ConceptResult.tsx](components/ConceptResult.tsx): section renderer + export/share actions
- [components/ConceptForm.tsx](components/ConceptForm.tsx)
- [components/LoadingSkeleton.tsx](components/LoadingSkeleton.tsx)
- [components/ErrorState.tsx](components/ErrorState.tsx)
- [components/EmptyState.tsx](components/EmptyState.tsx)
- [lib/types.ts](lib/types.ts): source-of-truth schema types
- [lib/store.ts](lib/store.ts): module-level in-memory Map store

## Data Contract

The API returns `ConceptResult`:

```ts
type ConceptResult = {
  id: string;
  createdAt: string;
  prompt: string;
  summary: string;
  brandPersonality: string[];
  audience: string;
  moodKeywords: string[];
  visualLanguage: string;
  palette: { hex: string; role: "primary" | "secondary" | "accent" | "neutral" | "background" }[];
  typography: { heading: string; body: string; rationale: string };
  voice: string;
  referenceImages: { id: string; prompt: string; url: string }[];
};
```

Notes:

- prompt max length: 500
- palette colors are regex-validated (`#RRGGBB`) with role-based fallback defaults
- image prompts are required as exactly 4 items before Pollinations URLs are generated

## Share Model

Share uses filesystem storage:

- Store: JSON files written to `.next/cache/conceptkit/` in dev, `/tmp/conceptkit/` in production (Vercel)
- Writer: generate route calls `saveConcept()` which writes `<id>.json`
- Reader: `/c/[id]` route calls `getConcept()` which reads the file synchronously
- Both routes declare `export const runtime = "nodejs"` so the `fs` module is available

Tradeoff: links are ephemeral across Vercel cold starts (each container starts fresh), but reliable within a running instance. Dev links persist across hot reloads.

## Styling System

Theme tokens live in CSS variables in [app/globals.css](app/globals.css) and are exposed to Tailwind as semantic colors:

- `background`
- `foreground`
- `card`
- `border`
- `muted-foreground`

Reusable component classes are defined for:

- `.chip`
- `.swatch`
- `.result-section`
- `.btn-primary`
- `.btn-secondary`

## Export Model

Export is client-side only:

- `html-to-image` captures the result container
- downloads PNG with filename `${id}.png`

No server-side export pipeline is used.

## Environment

Required:

```env
HF_API_KEY=hf_xxx
```

## Constraints

- Stack locked to Next.js 14.2.35 and the current dependencies.
- No auth, no database, and no paid external services.
