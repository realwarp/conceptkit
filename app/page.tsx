"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import ConceptForm from "@/components/ConceptForm";
import ConceptResultView from "@/components/ConceptResult";
import EmptyState from "@/components/EmptyState";
import ErrorState from "@/components/ErrorState";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import type { ConceptResult } from "@/lib/types";

const SAMPLE_PROMPTS = [
  "Minimal productivity app, Apple-esque, soft whites and subtle gradients",
  "Luxury streetwear brand, brutalist identity, raw concrete and gold",
  "Cozy Scandinavian interior design studio, warm oak and linen",
  "Noir detective film set in 1960s Tokyo, rain-soaked neon",
  "Editorial fashion magazine, high-contrast black and white",
  "Wellness app for sleep and meditation, soft gradients, calming",
];

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [result, setResult] = useState<ConceptResult | null>(null);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [error, setError] = useState("");

  function reset() {
    setResult(null);
    setPrompt("");
    setStatus("idle");
    setError("");
  }

  async function generate() {
    const cleanPrompt = prompt.trim();
    if (!cleanPrompt) return;

    setStatus("loading");
    setError("");
    setResult(null);

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: cleanPrompt }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");

      setResult(data as ConceptResult);
      setStatus("success");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Generation failed");
      setStatus("error");
    }
  }

  const hasResult = status === "success" && !!result;

  return (
    <main className="min-h-screen bg-background text-foreground px-5 md:px-10 lg:px-20">

      {/* ── Top nav ── */}
      <nav className="max-w-5xl mx-auto flex items-center justify-between py-5">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-accent opacity-80" />
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60">
            ConceptKit
          </span>
        </div>
        {hasResult && (
          <button
            onClick={reset}
            className="text-[11px] text-white/30 hover:text-white/55 transition-colors"
          >
            ← New concept
          </button>
        )}
      </nav>

      {/* ── Hero header — collapses when result shows ── */}
      {!hasResult && (
        <header className="max-w-5xl mx-auto pt-14 pb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/[0.06] mb-6">
            <span className="text-[10px] text-accent/70 font-medium tracking-wider uppercase">
              AI Creative Director
            </span>
          </div>
          <h1 className="text-[48px] md:text-[62px] font-serif font-normal mb-5 leading-[1.06] tracking-tight text-white/92">
            Your creative system,<br />in seconds.
          </h1>
          <p className="text-white/35 text-[17px] max-w-md mx-auto leading-relaxed">
            One prompt → palette, typography, brand voice, and a cinematic reference image.
          </p>
        </header>
      )}

      {/* ── Form ── */}
      <div className={hasResult ? "max-w-5xl mx-auto mb-8" : "max-w-5xl mx-auto mb-10"}>
        <ConceptForm
          prompt={prompt}
          loading={status === "loading"}
          onPromptChange={setPrompt}
          onSubmit={generate}
        />
      </div>

      {status === "idle" && (
        <EmptyState prompts={SAMPLE_PROMPTS} onSelectPrompt={setPrompt} />
      )}

      {status === "loading" && <LoadingSkeleton />}

      {status === "error" && (
        <ErrorState message={error || "Generation failed."} onRetry={generate} />
      )}

      {hasResult && <ConceptResultView result={result!} onReset={reset} />}

      {/* ── Footer ── */}
      <footer className="max-w-5xl mx-auto mt-16 py-7 border-t border-white/[0.04]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3 text-[11px] text-white/20">
          <div className="flex items-center gap-2">
            <Sparkles size={10} className="text-accent/40" />
            <span>ConceptKit</span>
          </div>
          <span>
            Built for the{" "}
            <a
              href="https://ibm.biz/ai-builders-challenge"
              className="text-accent/50 hover:text-accent/80 transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              IBM AI Builders Challenge
            </a>
            {" "}· July 2026
          </span>
        </div>
      </footer>

    </main>
  );
}
