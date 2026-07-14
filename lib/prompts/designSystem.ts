export type DesignSystem = {
  palette: Array<{ role: string; hex: string; rationale: string }>;
  typography: {
    heading: { family: string; rationale: string };
    body: { family: string; rationale: string };
    pairing: string;
  };
  imagePrompt: string;
};

export function buildDesignSystemPrompt(
  visualLanguage: string,
  moodKeywords: string[],
  brandPersonality: string[],
): { system: string; user: string } {
  const system = `You are a senior brand designer. Produce a tight, opinionated design system for the supplied creative direction. Output strict JSON matching the schema. No prose, no markdown, no commentary.`;

  const user = `Creative direction to translate into a design system:
- Visual language: ${visualLanguage}
- Mood keywords: ${moodKeywords.join(", ")}
- Brand personality: ${brandPersonality.join(", ")}

Return strict JSON with this exact shape:
{
  "palette": [
    { "role": "primary",    "hex": "#RRGGBB", "rationale": "One short sentence (<=18 words) explaining why this color serves the role." },
    { "role": "secondary",  "hex": "#RRGGBB", "rationale": "..." },
    { "role": "accent",     "hex": "#RRGGBB", "rationale": "..." },
    { "role": "neutral",    "hex": "#RRGGBB", "rationale": "..." },
    { "role": "background", "hex": "#RRGGBB", "rationale": "..." }
  ],
  "typography": {
    "heading": { "family": "Google Font name", "rationale": "One short sentence." },
    "body":    { "family": "Google Font name", "rationale": "One short sentence." },
    "pairing": "One short sentence describing how the heading + body work together."
  },
  "imagePrompt": "One short sentence (10-18 words) describing a hero reference image that visualises the mood. No preamble."
}

Rules:
- Hex values must be 7-char uppercase #RRGGBB and visually match the mood
- Choose Google Fonts only (e.g. "Space Grotesk", "Fraunces", "Inter", "DM Serif Display", "Manrope", "Sora", "Playfair Display", "IBM Plex Mono")
- Heading and body fonts must be different
- Palette must be internally coherent (no clashing)
- Return ONLY the JSON object`;

  return { system, user };
}
