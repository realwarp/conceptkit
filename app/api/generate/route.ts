import { NextResponse } from "next/server";
import { nanoid } from "nanoid";
import type { Color, ConceptResult } from "@/lib/types";
import { saveConcept } from "@/lib/share";
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
  { role: "primary",    hex: "#1A1A2E" },
  { role: "secondary",  hex: "#4A4A6A" },
  { role: "accent",     hex: "#D4A373" },
  { role: "neutral",    hex: "#C8C8D8" },
  { role: "background", hex: "#0A0A12" },
];

// ─── LLM caller — shared by both stages ──────────────────────────────────────

async function callLlm(
  apiKey: string,
  systemPrompt: string,
  userMessage: string,
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
          { role: "system", content: systemPrompt },
          { role: "user",   content: userMessage },
        ],
        max_tokens: maxTokens,
        temperature: 0.7,
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

function sanitizePalette(v: unknown): Color[] {
  if (!Array.isArray(v)) return DEFAULT_PALETTE;

  const byRole = new Map<Color["role"], string>();
  for (const item of v) {
    if (!item || typeof item !== "object") continue;
    const { role, hex } = item as { role?: string; hex?: string };
    if (!role || !hex) continue;
    if (!HEX_RE.test(hex)) continue;
    byRole.set(role as Color["role"], hex.toUpperCase());
  }

  return DEFAULT_PALETTE.map((c) => ({
    role: c.role,
    hex: byRole.get(c.role) ?? c.hex,
  }));
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
        CREATIVE_STRATEGY_PROMPT,
        `Concept: ${concept}\n\nRespond with the JSON object only.`,
        1200
      );

      const p = extractJson(raw);

      const strategy: CreativeStrategy = {
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

      return strategy;
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
      const raw = await callLlm(
        apiKey,
        buildDesignSystemPrompt(strategy),
        "Produce the design system JSON now.",
        900
      );

      const p = extractJson(raw);

      // Extract imagePrompt — support both singular and plural key
      const imagePrompt = sanitizeString(
        (p.imagePrompt as unknown) ??
          (Array.isArray(p.imagePrompts) ? (p.imagePrompts as string[])[0] : ""),
        `${strategy.title}. ${strategy.visualLanguage} Cinematic landscape, editorial photography.`
      );

      const ds: DesignSystem = {
        palette: sanitizePalette(p.palette),
        typography: {
          heading:  sanitizeString((p.typography as Record<string, unknown>)?.heading,   "Playfair Display"),
          body:     sanitizeString((p.typography as Record<string, unknown>)?.body,      "Inter"),
          rationale:sanitizeString((p.typography as Record<string, unknown>)?.rationale, "Expressive display meets clean body."),
        },
        imagePrompt,
      };

      return ds;
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

    // ── Stage 1: Creative Strategy ──────────────────────────────────────────
    const strategy = await runCreativeStrategy(apiKey, prompt);

    // ── Stage 2: Design System ──────────────────────────────────────────────
    const designSystem = await runDesignSystem(apiKey, strategy);

    // ── Build hero image URL ─────────────────────────────────────────────────
    const baseSeed = Date.now() % 1_000_000;
    const paletteColors = designSystem.palette
      .filter((c) => ["primary", "secondary", "accent"].includes(c.role))
      .map((c) => c.hex)
      .join(", ");
    const enrichedImagePrompt = `${designSystem.imagePrompt}, cinematic color grading inspired by ${paletteColors}, editorial quality`;

    // ── Compose final result ─────────────────────────────────────────────────
    const conceptResult: ConceptResult = {
      id:               nanoid(10),
      createdAt:        new Date().toISOString(),
      prompt,
      summary:          strategy.summary,
      brandPersonality: strategy.brandPersonality,
      audience:         strategy.audience,
      moodKeywords:     strategy.moodKeywords,
      visualLanguage:   strategy.visualLanguage,
      palette:          designSystem.palette,
      typography:       designSystem.typography,
      voice:            strategy.voice,
      referenceImages:  [{
        id:     nanoid(8),
        prompt: designSystem.imagePrompt,
        url:    pollinationsUrl(enrichedImagePrompt, baseSeed),
      }],
    };

    saveConcept(conceptResult);
    return NextResponse.json(conceptResult);

  } catch (err: unknown) {
    console.error("Generate error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Generation failed. Please try again." },
      { status: 500 }
    );
  }
}
