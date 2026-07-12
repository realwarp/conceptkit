/**
 * Stage 2 — Design System
 *
 * Purpose: consume the Creative Strategy and translate it into
 * specific, production-quality design decisions: exact HEX palette,
 * professional Google Font pairing, and the hero image prompt.
 *
 * This stage has access to the strategy context, so every decision
 * is grounded in the creative intent established in Stage 1.
 */

import type { CreativeStrategy } from "./creativeStrategy";

export type DesignSystem = {
  palette: Array<{ hex: string; role: "primary" | "secondary" | "accent" | "neutral" | "background" }>;
  typography: { heading: string; body: string; rationale: string };
  imagePrompt: string;
};

/**
 * Build the Design System prompt, injecting the Creative Strategy
 * so the LLM has full context for every decision.
 */
export function buildDesignSystemPrompt(strategy: CreativeStrategy): string {
  return `You are a principal product designer and art director.

You have been given this creative strategy:

CATEGORY: ${strategy.category}
TITLE: ${strategy.title}
SUMMARY: ${strategy.summary}
PALETTE MOOD: ${strategy.paletteMood}
TYPOGRAPHY MOOD: ${strategy.typographyMood}
VISUAL LANGUAGE: ${strategy.visualLanguage}
MOOD KEYWORDS: ${strategy.moodKeywords.join(", ")}

Your task: translate this creative strategy into precise design decisions.

PALETTE RULES:
- Produce exactly 5 colors with roles: primary, secondary, accent, neutral, background
- Colors must directly embody the paletteMood described above
- Strong contrast between background and primary — minimum 4.5:1 ratio
- Each color must serve a distinct visual purpose — no two shades that look the same
- Accent must be genuinely distinctive against background and primary
- No muddy grays unless the strategy explicitly calls for them
- For dark themes: background hex should be very dark (#0a–#1a range)
- For light themes: background hex should be near-white (#f0–#ff range)

TYPOGRAPHY RULES:
- Use ONLY real Google Fonts (verified to exist at fonts.google.com)
- heading and body must be DIFFERENT fonts — never identical
- Match the typographyMood precisely
- Category-specific guidance:
  UI / Product: geometric sans (Inter, DM Sans, Geist, Space Grotesk, Outfit, Plus Jakarta Sans)
  Branding / Identity: expressive display (Playfair Display, Bebas Neue, Archivo Black, Syne, Monument Extended) + clean body
  Spatial / Interior: humanist serif (Cormorant Garamond, Libre Baskerville) + sans (Source Sans 3, Nunito)
  Editorial / Print: editorial serif (Playfair Display, Lora, DM Serif Display) + mono or condensed (IBM Plex Mono, Barlow Condensed)
  Photography / Cinematic: cinematic display (Bebas Neue, Oswald, Anton) + body (Source Sans 3, Inter)
  Abstract / Conceptual: experimental (Syne, Raleway, Josefin Sans) + humanist body
  Lifestyle / Consumer: friendly humanist (Nunito, Jost, Poppins) + clean body (Lato, Inter)
- rationale: MAXIMUM 8 words. State the pairing benefit only. No brand names in rationale.
  BAD: "Bebas Neue's bold impact pairs with Inter's clarity."
  GOOD: "Cinematic weight contrast meets systematic clarity."

IMAGE PROMPT RULES:
- ONE single cinematic landscape-orientation hero image
- Must visually represent THIS specific concept — not generic
- Must embody the visual language: ${strategy.visualLanguage}
- Must reflect the palette mood: ${strategy.paletteMood}
- Include ALL of: specific subject matter, environment, named lighting technique, color mood, lens/camera style, composition approach
- 40-60 words
- Quality bar: Behance / Awwwards editorial photography standard
- Avoid: generic stock photography, generic nature, abstract gradients (unless explicitly conceptual)

Return ONLY a valid JSON object. No markdown. No code fences. No text outside the JSON.

{
  "palette": [
    {"hex": "#RRGGBB", "role": "primary"},
    {"hex": "#RRGGBB", "role": "secondary"},
    {"hex": "#RRGGBB", "role": "accent"},
    {"hex": "#RRGGBB", "role": "neutral"},
    {"hex": "#RRGGBB", "role": "background"}
  ],
  "typography": {
    "heading": "<Real Google Font — matches typographyMood and category>",
    "body": "<Real Google Font — different from heading, pairs intentionally>",
    "rationale": "<max 8 words, pairing benefit only>"
  },
  "imagePrompt": "<40-60 word cinematic hero image prompt, concept-specific>"
}`;
}
