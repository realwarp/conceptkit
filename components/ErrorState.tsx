type ErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export default function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <section className="max-w-2xl mx-auto mb-16 result-section border-red-400/50">
      <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
      <p className="text-sm text-muted-foreground mb-4">{message}</p>
      <button className="btn-primary" onClick={onRetry}>
        Retry
      </button>
    </section>
  );
}
