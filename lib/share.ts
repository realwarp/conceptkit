/**
 * URL-embedded concept sharing.
 *
 * We compress the concept into a URL-safe base64 string and put it
 * directly in the share link. No server storage needed — works on
 * Vercel's ephemeral filesystem.
 */

import type { ConceptResult } from "./types";

const ENC = "base64url" as const;

export function encodeConcept(concept: ConceptResult): string {
  const json = JSON.stringify(concept);
  return btoa(json)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function decodeConcept(encoded: string): ConceptResult | null {
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded);
    const parsed = JSON.parse(json) as ConceptResult;
    if (!parsed.id || !parsed.prompt || !parsed.palette) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function buildShareUrl(concept: ConceptResult, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/c/${encodeConcept(concept)}`;
}

export function extractFromShareParam(raw: string): string {
  return raw.replace(/^\//, "").split("?")[0].split("#")[0];
}
