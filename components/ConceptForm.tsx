type ConceptFormProps = {
  prompt: string;
  loading: boolean;
  onPromptChange: (value: string) => void;
  onSubmit: () => void;
};

export default function ConceptForm({
  prompt,
  loading,
  onPromptChange,
  onSubmit
}: ConceptFormProps) {
  return (
    <section className="max-w-2xl mx-auto mb-10">
      <div className="flex flex-col md:flex-row gap-3">
        <input
          className="input flex-1"
          placeholder="e.g. A noir detective film set in 1960s Tokyo"
          value={prompt}
          onChange={(e) => onPromptChange(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onSubmit()}
          disabled={loading}
          maxLength={500}
          aria-label="Describe your concept"
        />
        <button
          className="btn-primary whitespace-nowrap"
          onClick={onSubmit}
          disabled={loading || !prompt.trim()}
        >
          {loading ? "Generating..." : "Generate"}
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground text-center md:text-left">
        Keep it short and clear. Max 500 characters.
      </p>
    </section>
  );
}
