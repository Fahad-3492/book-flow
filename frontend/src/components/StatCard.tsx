interface StatCardProps {
  label: string;
  value: string | number;
  accent?: boolean;
}

export function StatCard({ label, value, accent = false }: StatCardProps) {
  return (
    <div className="bg-charcoal-raised border border-white/10 rounded-xl p-5">
      <p className="text-xs uppercase tracking-widest text-offwhite/50 mb-2">{label}</p>
      <p className={`font-display text-3xl ${accent ? 'text-amber' : 'text-offwhite'}`}>{value}</p>
    </div>
  );
}
