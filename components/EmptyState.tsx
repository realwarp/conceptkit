type EmptyStateProps = {
  prompts: string[];
  onSelectPrompt: (prompt: string) => void;
};

export default function EmptyState({ prompts, onSelectPrompt }: EmptyStateProps) {
  return (
    <section className="max-w-2xl mx-auto mb-16 text-center">
      <p className="text-sm text-muted-foreground mb-4">Try one of these:</p>
      <div className="flex flex-wrap gap-2 justify-center">
        {prompts.map((prompt) => (
          <button
            key={prompt}
            className="chip"
            onClick={() => onSelectPrompt(prompt)}
          >
            {prompt}
          </button>
        ))}
      </div>
    </section>
  );
}
