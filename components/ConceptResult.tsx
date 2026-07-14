"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { toPng } from "html-to-image";
import { motion } from "framer-motion";
import type { ConceptResult, Color } from "@/lib/types";

// ─── Google Fonts loader ─────────────────────────────────────────────────────

function useGoogleFonts(fonts: string[]) {
  useEffect(() => {
    if (typeof document === "undefined" || fonts.length === 0) return;
    const families = fonts
      .map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700`)
      .join("&");
    const href = `https://fonts.googleapis.com/css2?${families}&display=swap`;
    const existing = document.querySelector("link[data-gf]");
    if (existing) existing.remove();
    const link = document.createElement("link");
    link.rel = "stylesheet";
    link.href = href;
    link.dataset.gf = "1";
    document.head.appendChild(link);
  }, [fonts.join(",")]); // eslint-disable-line react-hooks/exhaustive-deps
}

// ─── Palette swatch ──────────────────────────────────────────────────────────

function PaletteSwatch({ color, onCopy }: { color: Color; onCopy: (hex: string) => void }) {
  const [copied, setCopied] = useState(false);

  function handleClick() {
    onCopy(color.hex);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  }

  return (
    <button
      className="group flex flex-col overflow-hidden rounded-lg border border-white/[0.07] transition-all duration-150 hover:scale-[1.05] hover:border-white/20 focus:outline-none focus:ring-1 focus:ring-white/20"
      style={{ backgroundColor: color.hex }}
      onClick={handleClick}
      title={`Copy ${color.hex}`}
      aria-label={`Copy ${color.role} color ${color.hex}`}
    >
      <div className="h-10" />
      <div className="bg-black/65 px-1.5 py-1.5 flex flex-col gap-0.5">
        <span className="text-[8px] font-medium text-white/40 uppercase tracking-widest leading-none">
          {color.role}
        </span>
        <span className="text-[9px] font-mono text-white/90 leading-none">
          {copied ? "✓" : color.hex.toUpperCase()}
        </span>
      </div>
    </button>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────

function Label({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-white/20 mb-2.5">
      {children}
    </p>
  );
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-xl border border-white/[0.06] bg-white/[0.02] p-4 ${className}`}>
      {children}
    </div>
  );
}

// ─── Mood chip ────────────────────────────────────────────────────────────────

function MoodChip({ label }: { label: string }) {
  return (
    <span
      className="px-2.5 py-1 rounded-full text-[11px] font-medium capitalize tracking-wide"
      style={{
        background: "rgba(201,149,92,0.12)",
        color: "rgba(237,233,223,0.7)",
        border: "1px solid rgba(201,149,92,0.2)",
      }}
    >
      {label}
    </span>
  );
}

// ─── Animation variants ───────────────────────────────────────────────────────

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.5, ease: "easeOut" as const },
  }),
};

// ─── Main component ───────────────────────────────────────────────────────────

type ConceptResultProps = {
  result: ConceptResult & { shareId?: string };
  readOnly?: boolean;
  onReset?: () => void;
};

export default function ConceptResultView({
  result,
  readOnly = false,
  onReset,
}: ConceptResultProps) {
  const exportRef = useRef<HTMLDivElement>(null);
  const [copyState, setCopyState] = useState("");
  const [exporting, setExporting] = useState(false);

  useGoogleFonts([result.typography.heading.family, result.typography.body.family]);

  const hero = result.referenceImages[0];

  async function copyText(text: string, label: string) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyState(`${label} copied`);
    } catch {
      setCopyState("Copy failed");
    } finally {
      setTimeout(() => setCopyState(""), 1800);
    }
  }

  const proxyUrl = useCallback((original: string) => {
    return `/api/image-proxy?url=${encodeURIComponent(original)}`;
  }, []);

  async function exportAsPng() {
    if (!exportRef.current || exporting) return;
    setExporting(true);

    const imgs = exportRef.current.querySelectorAll<HTMLImageElement>(
      "img[data-export-src]"
    );
    const originals: string[] = [];
    imgs.forEach((img) => {
      originals.push(img.src);
      img.src = img.dataset.exportSrc!;
    });

    await Promise.allSettled(
      Array.from(imgs).map(
        (img) =>
          new Promise<void>((resolve) => {
            if (img.complete) { resolve(); return; }
            img.onload = () => resolve();
            img.onerror = () => resolve();
          })
      )
    );

    try {
      await toPng(exportRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: "#08080d" });
      const dataUrl = await toPng(exportRef.current, { cacheBust: true, pixelRatio: 2, backgroundColor: "#08080d" });
      const link = document.createElement("a");
      link.href = dataUrl;
      link.download = `conceptkit-${result.id}.png`;
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
      setCopyState("Export failed — please try again");
      setTimeout(() => setCopyState(""), 2500);
    } finally {
      imgs.forEach((img, i) => { img.src = originals[i]; });
      setExporting(false);
    }
  }

  return (
    <motion.section
      className="max-w-5xl mx-auto mb-16"
      initial="hidden"
      animate="visible"
    >
      {/* ════════════════════════════════════════════
          EXPORT TARGET
          ════════════════════════════════════════════ */}
      <div
        ref={exportRef}
        className="rounded-2xl border border-white/[0.07] overflow-hidden"
        style={{ background: "#0d0d14" }}
      >

        {/* ── Header strip ── */}
        <motion.div
          custom={0}
          variants={fadeUp}
          className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-white/[0.05]"
        >
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent opacity-70" />
            <span className="text-[9px] font-semibold uppercase tracking-[0.25em] text-white/25">
              ConceptKit · Creative Direction
            </span>
          </div>
          <span className="text-[9px] font-mono text-white/15">{result.id}</span>
        </motion.div>

        <div className="px-6 pt-5 pb-6 space-y-5">

          {/* ══ ROW 1: Summary + mood chips ════════════════════════════════════ */}
          <motion.div custom={1} variants={fadeUp}>
            <h2
              className="text-[26px] md:text-[32px] leading-[1.12] tracking-tight text-white/95 mb-3"
              style={{ fontFamily: `'${result.typography.heading.family}', Georgia, serif` }}
            >
              {result.brandSummary}
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {result.moodKeywords.map((kw) => (
                <MoodChip key={kw} label={kw} />
              ))}
            </div>
          </motion.div>

          {/* ══ ROW 2: LEFT = hero | RIGHT = palette + typography + voice ══════ */}
          <motion.div
            custom={2}
            variants={fadeUp}
            className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4 items-stretch"
          >
            {/* LEFT — hero: natural aspect ratio, no stretch */}
            <div className="relative w-full h-full overflow-hidden rounded-xl bg-white/[0.02] border border-white/[0.06] min-h-[280px]">
              {hero ? (
                <HeroImageExportable
                  url={hero.url}
                  proxyUrl={proxyUrl(hero.url)}
                  prompt={hero.prompt}
                />
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-xs text-white/20">No image</span>
                </div>
              )}
            </div>

            {/* RIGHT column */}
            <div className="flex flex-col gap-3">

              {/* Colour Palette */}
              <Card>
                <Label>Colour Palette</Label>
                <div className="grid grid-cols-5 gap-1.5">
                  {result.palette.map((color) => (
                    <PaletteSwatch
                      key={color.role}
                      color={color}
                      onCopy={(hex) => copyText(hex, hex)}
                    />
                  ))}
                </div>
              </Card>

              {/* Typography */}
              <Card>
                <Label>Typography</Label>
                <div className="grid grid-cols-2 gap-2 mb-2.5">
                  <div className="rounded-lg bg-black/25 border border-white/[0.05] p-2.5">
                    <p className="text-[8px] text-white/25 uppercase tracking-widest mb-1.5">Heading</p>
                    <p
                      style={{ fontFamily: `'${result.typography.heading.family}', serif` }}
                      className="text-sm leading-tight text-white/85 truncate"
                    >
                      {result.typography.heading.family}
                    </p>
                  </div>
                  <div className="rounded-lg bg-black/25 border border-white/[0.05] p-2.5">
                    <p className="text-[8px] text-white/25 uppercase tracking-widest mb-1.5">Body</p>
                    <p
                      style={{ fontFamily: `'${result.typography.body.family}', sans-serif` }}
                      className="text-sm leading-tight text-white/85 truncate"
                    >
                      {result.typography.body.family}
                    </p>
                  </div>
                </div>
                <p className="text-[10px] text-white/30 leading-snug italic">
                  {result.typography.heading.rationale} {result.typography.body.rationale}
                </p>
              </Card>

              {/* Brand Voice — expands to fill remaining space */}
              <Card className="flex-1">
                <Label>Brand Voice</Label>
                <p
                  className="text-[15px] leading-relaxed text-white/75"
                  style={{ fontFamily: `'${result.typography.heading.family}', Georgia, serif` }}
                >
                  {result.voice}
                </p>
              </Card>

            </div>
          </motion.div>

          {/* ══ ROW 3: 4 metadata cards ══════════════════════════════════════════ */}
          <motion.div
            custom={3}
            variants={fadeUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {/* Brand Personality */}
            <Card className="flex flex-col gap-2.5">
              <Label>Personality</Label>
              <div className="flex flex-wrap gap-1.5">
                {result.brandPersonality.map((trait) => (
                  <span
                    key={trait}
                    className="px-2 py-0.5 rounded-full border border-white/[0.08] bg-white/[0.03] text-[10px] text-white/55 capitalize"
                  >
                    {trait}
                  </span>
                ))}
              </div>
            </Card>

            {/* Audience */}
            <Card className="flex flex-col gap-2.5">
              <Label>Audience</Label>
              <p
                className="text-sm font-medium text-white/65 leading-snug"
                style={{ fontFamily: `'${result.typography.body.family}', sans-serif` }}
              >
                {result.audience}
              </p>
            </Card>

            {/* Visual Language */}
            <Card className="flex flex-col gap-2.5">
              <Label>Visual Language</Label>
              <p className="text-[11px] text-white/38 leading-relaxed">
                {result.visualLanguage}
              </p>
            </Card>

            {/* Concept — show category/title, not raw prompt */}
            <Card className="flex flex-col gap-2.5">
              <Label>Concept</Label>
              <p className="text-[10px] text-white/25 uppercase tracking-widest mb-1">
                {result.referenceImages[0]?.prompt
                  ? "Visual Reference"
                  : "Input"}
              </p>
              <p
                className="text-[11px] text-white/45 leading-relaxed italic"
                style={{ fontFamily: `'${result.typography.body.family}', sans-serif` }}
              >
                &ldquo;{result.prompt}&rdquo;
              </p>
            </Card>
          </motion.div>

        </div>
      </div>
      {/* end export target */}

      {/* ── Actions ── */}
      {!readOnly && (
        <motion.div
          custom={4}
          variants={fadeUp}
          className="mt-4 flex flex-wrap items-center gap-2.5"
        >
          <button className="btn-primary" onClick={exportAsPng} disabled={exporting}>
            {exporting ? "Exporting…" : "↓ Export PNG"}
          </button>
          <button
            className="btn-secondary"
            onClick={() => copyText(`${window.location.origin}/c/${result.shareId}`, "Share link")}
          >
            ⟁ Copy share link
          </button>
          {onReset && (
            <button className="btn-secondary" onClick={onReset}>
              + New concept
            </button>
          )}
          {copyState && (
            <motion.span
              key={copyState}
              initial={{ opacity: 0, x: -4 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              className="text-xs text-white/35"
            >
              {copyState}
            </motion.span>
          )}
        </motion.div>
      )}
    </motion.section>
  );
}

// ─── Hero image subcomponent ──────────────────────────────────────────────────
// Uses object-contain so the image is never cropped or distorted.
// A dark bg fills the container; the image sits centred at its natural ratio.

function HeroImageExportable({
  url,
  proxyUrl,
  prompt,
}: {
  url: string;
  proxyUrl: string;
  prompt: string;
}) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [status, setStatus] = useState<"loading" | "loaded" | "error">("loading");
  const [attempt, setAttempt] = useState(0);
  const [src, setSrc] = useState(url);
  const MAX_RETRIES = 3;

  useEffect(() => {
    if (status !== "error" || attempt >= MAX_RETRIES) return;
    const t = setTimeout(() => {
      setAttempt((a) => a + 1);
      setStatus("loading");
      setSrc(`${url}&_r=${attempt + 1}`);
    }, (attempt + 1) * 2000);
    return () => clearTimeout(t);
  }, [status, attempt, url]);

  useEffect(() => {
    if (imgRef.current?.complete && imgRef.current.naturalWidth > 0)
      setStatus("loaded");
  }, [src]);

  const failed = status === "error" && attempt >= MAX_RETRIES;

  return (
    <>
      {status === "loading" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
          <div className="h-5 w-5 rounded-full border-2 border-white/[0.08] border-t-accent animate-spin" />
          <span className="text-[10px] text-white/20 tracking-widest uppercase">
            Generating image
          </span>
        </div>
      )}
      {failed && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-8 text-center">
          <span className="text-xs text-white/25">Image unavailable</span>
          <span className="text-[10px] text-white/15 leading-relaxed max-w-sm">
            {prompt}
          </span>
        </div>
      )}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={imgRef}
        src={src}
        data-export-src={proxyUrl}
        alt={prompt}
        className={`absolute inset-0 w-full h-full object-contain transition-opacity duration-700 ${
          status === "loaded" ? "opacity-100" : "opacity-0"
        }`}
        onLoad={() => setStatus("loaded")}
        onError={() => setStatus("error")}
      />
      {status === "loaded" && (
        <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
      )}
    </>
  );
}
