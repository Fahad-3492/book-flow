import { useState } from 'react';
import type { Service } from '../types';
import { formatDuration } from '../lib/format';

interface HeroBookingPreviewProps {
  services: Service[];
  onPickService: (service: Service) => void;
}

// A handful of representative time slots shown purely for the hero's visual
// demo — the real slot grid (wired to live availability) lives on the
// service detail page once a service is picked.
const DEMO_SLOTS = ['9:00', '9:30', '11:00', '1:00', '2:30', '4:00'];

export function HeroBookingPreview({ services, onPickService }: HeroBookingPreviewProps) {
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    services[0]?.id ?? null
  );
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null);

  const selectedService = services.find((s) => s.id === selectedServiceId) ?? null;

  return (
    <div className="bg-charcoal-raised border border-white/10 rounded-3xl p-6 sm:p-8 w-full max-w-md">
      <p className="text-xs uppercase tracking-widest text-sage mb-4">Try it — pick a time</p>

      <div className="flex flex-wrap gap-2 mb-6">
        {services.slice(0, 4).map((service) => (
          <button
            key={service.id}
            onClick={() => setSelectedServiceId(service.id)}
            className={`px-3.5 py-2 rounded-full text-sm font-medium transition-colors border ${
              selectedServiceId === service.id
                ? 'bg-amber text-charcoal border-amber'
                : 'border-white/15 text-offwhite/70 hover:border-white/30'
            }`}
          >
            {service.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-3 gap-2 mb-6">
        {DEMO_SLOTS.map((slot) => (
          <button
            key={slot}
            onClick={() => setSelectedSlot(slot)}
            className={`py-2.5 rounded-lg text-sm font-medium transition-colors border ${
              selectedSlot === slot
                ? 'bg-amber text-charcoal border-amber'
                : 'border-white/10 bg-charcoal text-offwhite/80 hover:border-amber/50'
            }`}
          >
            {slot}
          </button>
        ))}
      </div>

      <button
        onClick={() => selectedService && onPickService(selectedService)}
        disabled={!selectedService}
        className="w-full bg-amber hover:bg-amber-bright disabled:opacity-40 disabled:cursor-not-allowed text-charcoal font-semibold py-3 rounded-xl transition-colors"
      >
        {selectedService
          ? `Book ${selectedService.name} — see real availability`
          : 'Pick a service to continue'}
      </button>

      {selectedService && (
        <p className="text-xs text-offwhite/40 mt-3 text-center">
          {formatDuration(selectedService.duration_minutes)} session — real slots shown next
        </p>
      )}
    </div>
  );
}
