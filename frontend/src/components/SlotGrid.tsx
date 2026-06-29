interface SlotGridProps {
  slots: string[];
  selectedSlot: string | null;
  onSelectSlot: (slot: string) => void;
}

export function SlotGrid({ slots, selectedSlot, onSelectSlot }: SlotGridProps) {
  if (slots.length === 0) {
    return (
      <p className="text-offwhite/50 text-sm py-6 text-center">
        No open times on this day. Try another date.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {slots.map((slot) => (
        <button
          key={slot}
          onClick={() => onSelectSlot(slot)}
          className={`py-2.5 rounded-lg text-sm font-medium transition-colors border ${
            selectedSlot === slot
              ? 'bg-amber text-charcoal border-amber'
              : 'border-white/10 bg-charcoal-raised text-offwhite/80 hover:border-amber/50'
          }`}
        >
          {slot}
        </button>
      ))}
    </div>
  );
}
