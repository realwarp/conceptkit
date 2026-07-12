import { writeFileSync, readFileSync, mkdirSync } from "fs";
import { join } from "path";
import type { ConceptResult } from "@/lib/types";

// Use /tmp in production (Vercel serverless), .next/cache/concepts in dev.
// Both are writable at runtime and shared across route handlers in the same
// process/container — unlike a module-level Map which is isolated per bundle.
const STORE_DIR =
  process.env.NODE_ENV === "production"
    ? "/tmp/conceptkit"
    : join(process.cwd(), ".next", "cache", "conceptkit");

function ensureDir() {
  try {
    mkdirSync(STORE_DIR, { recursive: true });
  } catch {
    // already exists
  }
}

function filePath(id: string): string {
  // Sanitize id to prevent path traversal — nanoid(10) is alphanumeric but be explicit.
  const safe = id.replace(/[^a-zA-Z0-9_-]/g, "");
  return join(STORE_DIR, `${safe}.json`);
}

export function saveConcept(result: ConceptResult): void {
  ensureDir();
  writeFileSync(filePath(result.id), JSON.stringify(result), "utf-8");
}

export function getConcept(id: string): ConceptResult | null {
  ensureDir();
  try {
    const raw = readFileSync(filePath(id), "utf-8");
    return JSON.parse(raw) as ConceptResult;
  } catch {
    return null;
  }
}
