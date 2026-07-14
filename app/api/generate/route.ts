import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import type {
  Color,
  ColorRole,
  ConceptResult,
  FontChoice,
  ReferenceImage,
  Typography,
} from "@/lib/types";
import { encodeConcept } from "@/lib/share";
import { saveConcept } from "@/lib/store";
import {
  CREATIVE_STRATEGY_PROMPT,
  type CreativeStrategy,
} from "@/lib/prompts/creativeStrategy";
import {
  buildDesignSystemPrompt,
  type DesignSystem,
} from "@/lib/prompts/designSystem";

export const runtime = "nodejs";
export const maxDuration = 60;

// ─── Constants ───────────────────────────────────────────────────────────────

const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";
const HF_MODEL = "meta-llama/Llama-3.3-70B-Instruct";
const FETCH_TIMEOUT_MS = 30_000;
const HEX_RE = /^#[0-9a-fA-F]{6}$/;

const DEFAULT_PALETTE: Color[] = [
  { role: "primary",    hex: "#1A1A2E", rationale: "Default anchor color used when palette enrichment fails." },
  { role: "secondary",  hex: "#4A4A6A", rationale: "Default supporting tone used when palette enrichment fails." },
  { role: "accent",     hex: "#D4A373", rationale: "Default highlight color used when palette enrichment fails." },
  { role: "neutral",    hex: "#C8C8D8", rationale: "Default quiet tone used when palette enrichment fails." },
  { role: "background", hex: "#0A0A12", rationale: "Default surface color used when palette enrichment fails." },
];

const VALID_ROLES: ColorRole[] = ["primary", "secondary", "accent", "neutral", "background"];

// ─── LLM caller ──────────────────────────────────────────────────────────────

async function callLlm(
  apiKey: string,
  prompts: { system: string; user: string },
  maxTokens: number
): Promise<string> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

  let res: Response;
  try {
    res = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: HF_MODEL,
        messages: [
          { role: "system", content: prompts.system },
          { role: "user", content: prompts.user },
        ],
        temperature: 0.7,
        max_tokens: maxTokens,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });
  } catch (err) {
    clearTimeout(timeoutId);
    const isTimeout = err instanceof Error && err.name === "AbortError";
    throw new Error(
      isTimeout
        ? "Request timed out after 30 seconds. Please try again."
        : `LLM request failed: ${err instanceof Error ? err.message : String(err)}`
    );
  }
  clearTimeout(timeoutId);

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`LLM request failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const choice = data.choices?.[0];

  if (choice?.finish_reason === "length") {
    throw new Error("LLM response truncated — token limit hit. Please try again.");
  }

  return (choice?.message?.content ?? "") as string;
}

// ─── JSON extractor ──────────────────────────────────────────────────────────

function extractJson(text: string): Record<string, unknown> {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error("LLM did not return a valid JSON object");
  return JSON.parse(match[0]) as Record<string, unknown>;
}

// ─── Sanitisers ───────────────────────────────────────────────────────────────

function sanitizeString(v: unknown, fallback: string): string {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function sanitizeWords(v: unknown, min: number, max: number, fallback: string[]): string[] {
  if (!Array.isArray(v)) return fallback;
  const words = v
    .map((x) => (typeof x === "string" ? x.trim() : ""))
    .filter(Boolean)
    .slice(0, max);
  return words.length >= min ? words : fallback;
}

function isColorRole(v: unknown): v is ColorRole {
  return typeof v === "string" && (VALID_ROLES as string[]).includes(v);
}

function sanitizePalette(v: unknown): Color[] {
  if (!Array.isArray(v)) return DEFAULT_PALETTE;

  const byRole = new Map<ColorRole, string>();
  for (const item of v) {
    if (!item || typeof item !== "object") continue;
    const { role, hex } = item as { role?: unknown; hex?: unknown };
    if (!isColorRole(role) || typeof hex !== "string") continue;
    if (!HEX_RE.test(hex)) continue;
    byRole.set(role, hex.toUpperCase());
  }

  return DEFAULT_PALETTE.map((c) => {
    const override = byRole.get(c.role);
    return {
      role: c.role,
      hex: override ?? c.hex,
      rationale: override
        ? `AI selected ${c.role} tone for the concept.`
        : c.rationale,
    };
  });
}

function sanitizeFont(v: unknown, fallbackFamily: string): FontChoice {
  if (v && typeof v === "object") {
    const r = v as Record<string, unknown>;
    return {
      family: sanitizeString(r.family, fallbackFamily),
      rationale: sanitizeString(r.rationale, ""),
    };
  }
  return {
    family: sanitizeString(v, fallbackFamily),
    rationale: "",
  };
}

function sanitizeTypography(v: unknown): Typography {
  if (!v || typeof v !== "object") {
    return {
      heading: { family: "Playfair Display", rationale: "Default display font for fallback." },
      body: { family: "Inter", rationale: "Default body font for fallback." },
      pairing: "Expressive display meets clean body.",
    };
  }
  const t = v as Record<string, unknown>;
  return {
    heading: sanitizeFont(t.heading, "Playfair Display"),
    body: sanitizeFont(t.body, "Inter"),
    pairing: sanitizeString(t.pairing, "Expressive display meets clean body."),
  };
}

// ─── Stage 1: Creative Strategy ──────────────────────────────────────────────

async function runCreativeStrategy(
  apiKey: string,
  concept: string
): Promise<CreativeStrategy> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const raw = await callLlm(
        apiKey,
        { system: CREATIVE_STRATEGY_PROMPT, user: concept },
        900
      );

      const p = extractJson(raw);

      return {
        category:         sanitizeString(p.category,         "UI / Product"),
        title:            sanitizeString(p.title,            "Untitled Concept"),
        summary:          sanitizeString(p.summary,          "A focused creative direction."),
        audience:         sanitizeString(p.audience,         "Design-conscious creators."),
        brandPersonality: sanitizeWords(p.brandPersonality,  3, 5, ["focused", "crafted", "confident"]),
        moodKeywords:     sanitizeWords(p.moodKeywords,      4, 6, ["cinematic", "textural", "atmospheric", "intentional"]),
        visualLanguage:   sanitizeString(p.visualLanguage,   "Deliberate composition with directional light."),
        paletteMood:      sanitizeString(p.paletteMood,      "Dark, high-contrast with a warm accent."),
        typographyMood:   sanitizeString(p.typographyMood,   "Geometric sans-serif for clarity and modernity."),
        voice:            sanitizeString(p.voice,            "Built for clarity. Designed for focus."),
      };
    } catch (err) {
      lastError = err;
      if (attempt === 1) break;
    }
  }

  throw new Error(
    lastError instanceof Error
      ? `Creative strategy failed: ${lastError.message}`
      : "Creative strategy generation failed"
  );
}

// ─── Stage 2: Design System ───────────────────────────────────────────────────

async function runDesignSystem(
  apiKey: string,
  strategy: CreativeStrategy
): Promise<DesignSystem> {
  let lastError: unknown = null;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const prompts = buildDesignSystemPrompt(strategy);
      const raw = await callLlm(apiKey, prompts, 900);
      const p = extractJson(raw);

      const imagePrompt = sanitizeString(
        (p.imagePrompt as unknown) ??
          (Array.isArray(p.imagePrompts) ? (p.imagePrompts as string[])[0] : ""),
        `${strategy.title}. ${strategy.visualLanguage} Cinematic landscape, editorial photography.`
      );

      return {
        palette: sanitizePalette(p.palette),
        typography: sanitizeTypography(p.typography),
        imagePrompt,
      };
    } catch (err) {
      lastError = err;
      if (attempt === 1) break;
    }
  }

  throw new Error(
    lastError instanceof Error
      ? `Design system failed: ${lastError.message}`
      : "Design system generation failed"
  );
}

// ─── Image URL builder ────────────────────────────────────────────────────────

function pollinationsUrl(prompt: string, seed: number): string {
  const encoded = encodeURIComponent(prompt);
  return `https://image.pollinations.ai/prompt/${encoded}?width=1280&height=720&seed=${seed}&model=flux&nologo=true&enhance=false&private=true`;
}

// ─── POST handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { prompt?: string };
    const prompt = body.prompt?.trim() ?? "";

    if (!prompt) {
      return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    }

    if (prompt.length > 500) {
      return NextResponse.json(
        { error: "Prompt must be 500 characters or fewer" },
        { status: 400 }
      );
    }

    const apiKey = process.env.HF_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "HF_API_KEY not configured. Add it to .env.local" },
        { status: 500 }
      );
    }

    const strategy = await runCreativeStrategy(apiKey, prompt);
    const designSystem = await runDesignSystem(apiKey, strategy);

    const baseSeed = Date.now() % 1_000_000;
    const referenceImages: ReferenceImage[] = Array.from({ length: 4 }).map((_, i) => {
      const variation = `${strategy.visualLanguage}, variation ${i + 1}, concept: ${prompt}`;
      return {
        url: pollinationsUrl(variation, baseSeed + i),
        prompt: variation,
      };
    });

    const conceptResult: ConceptResult = {
      id:               nanoid(10),
      concept:          prompt,
      brandSummary:     strategy.summary,
      brandPersonality: strategy.brandPersonality,
      audience:         strategy.audience,
      moodKeywords:     strategy.moodKeywords,
      visualLanguage:   strategy.visualLanguage,
      palette:          designSystem.palette,
      typography:       designSystem.typography,
      voice:            strategy.voice,
      referenceImages,
    };

    await saveConcept(conceptResult);
    const shareId = encodeConcept(conceptResult);

    return NextResponse.json({ ...conceptResult, shareId });

  } catch (err: unknown) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}
