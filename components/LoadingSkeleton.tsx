"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// Phases mirror the actual two-stage pipeline timing
const PHASES = [
  { label: "Reading your concept...",          duration: 1800 },
  { label: "Developing creative strategy...",  duration: 9000 },  // Stage 1 LLM (~10s)
  { label: "Building design system...",        duration: 9000 },  // Stage 2 LLM (~10s)
  { label: "Generating hero image...",         duration: 99999 }, // Pollinations (background)
];

export default function LoadingSkeleton() {
  const [phaseIndex, setPhaseIndex] = useState(0);

  useEffect(() => {
    if (phaseIndex >= PHASES.length - 1) return;
    const t = setTimeout(() => setPhaseIndex((i) => i + 1), PHASES[phaseIndex].duration);
    return () => clearTimeout(t);
  }, [phaseIndex]);

  const progress = Math.min((phaseIndex / (PHASES.length - 1)) * 100, 95);

  return (
    <section className="max-w-5xl mx-auto">

      {/* Status row */}
      <div className="mb-5 flex items-center gap-3">
        <div className="h-3 w-3 rounded-full border-2 border-white/[0.08] border-t-accent animate-spin flex-shrink-0" />
        <div className="h-4 overflow-hidden relative flex-1">
          <AnimatePresence mode="wait">
            <motion.p
              key={phaseIndex}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="text-sm text-white/35"
            >
              {PHASES[phaseIndex].label}
            </motion.p>
          </AnimatePresence>
        </div>
        <span className="text-[10px] text-white/18 tabular-nums flex-shrink-0 font-mono">
          {phaseIndex + 1}/{PHASES.length}
        </span>
      </div>

      {/* Progress bar */}
      <div className="mb-6 h-px bg-white/[0.05] rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent rounded-full"
          initial={{ width: "0%" }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
        />
      </div>

      {/* Skeleton — matches real layout */}
      <div className="rounded-2xl border border-white/[0.07] overflow-hidden" style={{ background: "#0d0d14" }}>

        {/* Header strip */}
        <div className="flex items-center justify-between px-6 pt-5 pb-0">
          <div className="h-2 w-48 rounded-full bg-white/[0.05] animate-pulse" />
          <div className="h-2 w-16 rounded-full bg-white/[0.04] animate-pulse" />
        </div>

        <div className="px-6 pt-5 pb-6 space-y-5">

          {/* ROW 1: Summary + mood chips */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}>
            <div className="h-2 w-24 rounded-full bg-white/[0.06] mb-3 animate-pulse" />
            <div className="h-7 w-3/4 rounded-lg bg-white/[0.06] animate-pulse" />
            <div className="h-6 w-1/2 rounded-lg bg-white/[0.04] mt-2 animate-pulse" />
            {/* Mood chips */}
            <div className="flex gap-2 mt-3">
              {[55, 65, 50, 70, 60].map((w, i) => (
                <div key={i} className="h-6 rounded-full bg-white/[0.05] animate-pulse" style={{ width: w }} />
              ))}
            </div>
          </motion.div>

          {/* ROW 2: LEFT hero | RIGHT column */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-stretch"
          >
            {/* LEFT tall hero — stretches to match right column */}
            <div
              className="w-full h-full rounded-xl bg-white/[0.04] border border-white/[0.06] animate-pulse min-h-[280px]"
            />

            {/* RIGHT column */}
            <div className="flex flex-col gap-4">

              {/* Palette card */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                <div className="h-2 w-20 rounded-full bg-white/[0.06] mb-3 animate-pulse" />
                <div className="grid grid-cols-5 gap-1.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="rounded-lg bg-white/[0.06] animate-pulse" style={{ height: 64 }} />
                  ))}
                </div>
              </div>

              {/* Typography card */}
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                <div className="h-2 w-20 rounded-full bg-white/[0.06] mb-3 animate-pulse" />
                <div className="grid grid-cols-2 gap-2 mb-3">
                  {[0, 1].map((i) => (
                    <div key={i} className="rounded-lg border border-white/[0.06] bg-black/20 p-3">
                      <div className="h-1.5 w-10 rounded bg-white/[0.06] mb-2 animate-pulse" />
                      <div className="h-4 w-3/4 rounded bg-white/[0.06] animate-pulse" />
                    </div>
                  ))}
                </div>
                <div className="h-2 w-full rounded-full bg-white/[0.05] animate-pulse" />
              </div>

              {/* Voice card — flex-1 to fill remaining space */}
              <div className="flex-1 rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                <div className="h-2 w-20 rounded-full bg-white/[0.06] mb-3 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-3 w-full rounded bg-white/[0.06] animate-pulse" />
                  <div className="h-3 w-4/5 rounded bg-white/[0.05] animate-pulse" />
                </div>
              </div>

            </div>
          </motion.div>

          {/* ROW 3: 4 metadata cards */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="grid grid-cols-2 md:grid-cols-4 gap-3"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-xl border border-white/[0.06] bg-white/[0.025] p-4">
                <div className="h-2 w-16 rounded-full bg-white/[0.06] mb-3 animate-pulse" />
                <div className="space-y-1.5">
                  <div className="h-2.5 w-full rounded bg-white/[0.06] animate-pulse" />
                  <div className="h-2.5 w-3/4 rounded bg-white/[0.05] animate-pulse" />
                  {i < 2 && <div className="h-2.5 w-1/2 rounded bg-white/[0.04] animate-pulse" />}
                </div>
              </div>
            ))}
          </motion.div>

        </div>
      </div>
    </section>
  );
}
