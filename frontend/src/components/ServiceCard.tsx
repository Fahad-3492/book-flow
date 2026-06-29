import type { Service } from '../types';
import { formatPrice, formatDuration } from '../lib/format';

interface ServiceCardProps {
  service: Service;
  onSelect: (service: Service) => void;
}

export function ServiceCard({ service, onSelect }: ServiceCardProps) {
  return (
    <button
      onClick={() => onSelect(service)}
      className="group w-full text-left bg-charcoal-raised border border-white/10 rounded-2xl p-6 transition-all hover:border-amber/50 hover:-translate-y-0.5 focus-visible:border-amber"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-display text-2xl text-offwhite mb-1.5">{service.name}</h3>
          {service.description && (
            <p className="text-sm text-offwhite/60 leading-relaxed mb-3 max-w-sm">
              {service.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-sm text-sage">
            <span>{formatDuration(service.duration_minutes)}</span>
            <span className="w-1 h-1 rounded-full bg-sage/40" />
            <span>{formatPrice(service.price)}</span>
          </div>
        </div>
        <span
          aria-hidden="true"
          className="shrink-0 text-amber text-xl transition-transform group-hover:translate-x-1"
        >
          →
        </span>
      </div>
    </button>
  );
}
