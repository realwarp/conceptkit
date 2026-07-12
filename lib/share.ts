/**
 * URL-embedded concept sharing.
 *
 * Instead of storing concepts on a server (which dies on Vercel's
 * ephemeral filesystem), we compress the concept into a URL-safe
 * base64 string and put it directly in the share link.
 *
 * - No backend storage required
 * - Share links work forever
 * - Survives across deploys, regions, restarts
 *
 * Trade-off: longer URLs. A typical concept compresses to ~400-800 chars
 * in the URL, which is well within practical limits.
 */

import type { ConceptResult } from "./types";

const ENC = "base64url";

/** Encode a concept to a URL-safe string. */
export function encodeConcept(concept: ConceptResult): string {
  const json = JSON.stringify(concept);
  return btoa(json)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

/** Decode a concept from a URL-safe string. Returns null if invalid. */
export function decodeConcept(encoded: string): ConceptResult | null {
  try {
    const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(padded);
    const parsed = JSON.parse(json) as ConceptResult;
    if (!parsed.id || !parsed.concept || !parsed.images) return null;
    return parsed;
  } catch {
    return null;
  }
}

/** Build a shareable URL for a concept. */
export function buildShareUrl(concept: ConceptResult, origin?: string): string {
  const base = origin ?? (typeof window !== "undefined" ? window.location.origin : "");
  return `${base}/c/${encodeConcept(concept)}`;
}

/** Extract the encoded concept from a share URL or raw id. */
export function extractFromShareParam(raw: string): string {
  // Strip leading slash, query, hash
  return raw.replace(/^\//, "").split("?")[0].split("#")[0];
}
