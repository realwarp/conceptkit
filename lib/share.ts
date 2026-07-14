import type { ConceptResult } from "./types";

const ENC = "base64url" as const;

function toBase64Url(input: string): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(input, "utf8").toString("base64url");
  }
  return btoa(unescape(encodeURIComponent(input)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function fromBase64Url(encoded: string): string {
  const padded = encoded.replace(/-/g, "+").replace(/_/g, "/");
  if (typeof Buffer !== "undefined") {
    return Buffer.from(padded, "base64").toString("utf8");
  }
  return decodeURIComponent(escape(atob(padded)));
}

export function encodeConcept(concept: ConceptResult): string {
  return toBase64Url(JSON.stringify(concept));
}

export function decodeConcept(encoded: string): ConceptResult | null {
  try {
    const json = fromBase64Url(encoded);
    const parsed = JSON.parse(json) as ConceptResult;
    if (!parsed.id || !parsed.palette) return null;
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
