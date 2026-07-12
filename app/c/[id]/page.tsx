import { notFound } from "next/navigation";
import { Sparkles } from "lucide-react";
import ConceptResultView from "@/components/ConceptResult";
import { decodeConcept, extractFromShareParam } from "@/lib/share";

export const runtime = "nodejs";

type SharePageProps = {
  params: { id: string };
};

export default function SharePage({ params }: SharePageProps) {
  const result = decodeConcept(extractFromShareParam(params.id));

  if (!result) notFound();

  return (
    <main className="min-h-screen bg-background text-foreground px-5 md:px-10 lg:px-20">

      {/* ── Nav ── */}
      <nav className="max-w-5xl mx-auto flex items-center justify-between py-5">
        <a href="/" className="flex items-center gap-2 group">
          <Sparkles size={13} className="text-accent opacity-80" />
          <span className="text-[11px] font-semibold tracking-[0.2em] uppercase text-white/60 group-hover:text-white/80 transition-colors">
            ConceptKit
          </span>
        </a>
        <a
          href="/"
          className="text-[11px] text-white/30 hover:text-white/55 transition-colors"
        >
          ← Create your own
        </a>
      </nav>

      {/* ── Shared concept header ── */}
      <header className="max-w-5xl mx-auto pt-6 pb-8">
        <p className="text-[10px] text-white/20 uppercase tracking-[0.2em] mb-2">Shared Creative Direction</p>
        <p
          className="text-[13px] text-white/35 italic max-w-xl"
        >
          &ldquo;{result.prompt}&rdquo;
        </p>
      </header>

      <ConceptResultView result={result} readOnly />

      <footer className="max-w-5xl mx-auto mt-16 py-7 border-t border-white/[0.04] text-center text-[11px] text-white/18">
        <a href="/" className="text-accent/50 hover:text-accent/70 transition-colors">
          Create your own concept →
        </a>
      </footer>

    </main>
  );
}
