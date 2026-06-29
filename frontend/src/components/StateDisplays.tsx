export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center py-16 text-offwhite/50 text-sm">
      <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber animate-pulse mr-2" />
      {label}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="bg-rust/10 border border-rust/30 rounded-xl p-4 text-rust text-sm">
      {message}
    </div>
  );
}

export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="text-center py-16">
      <p className="text-offwhite/70 mb-1">{title}</p>
      {hint && <p className="text-offwhite/40 text-sm">{hint}</p>}
    </div>
  );
}
