import { useMemo } from 'react';

interface DatePickerProps {
  selectedDate: string; // "YYYY-MM-DD"
  onSelectDate: (date: string) => void;
  daysAhead?: number;
}

function toDateStr(d: Date): string {
  return d.toISOString().slice(0, 10);
}

const WEEKDAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function DatePicker({ selectedDate, onSelectDate, daysAhead = 14 }: DatePickerProps) {
  // Generate the next N days starting today, computed once per mount.
  const days = useMemo(() => {
    const today = new Date();
    today.setHours(12, 0, 0, 0); // avoid DST edge cases shifting the date
    return Array.from({ length: daysAhead }, (_, i) => {
      const d = new Date(today);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [daysAhead]);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-1 px-1">
      {days.map((day) => {
        const dateStr = toDateStr(day);
        const isSelected = dateStr === selectedDate;
        return (
          <button
            key={dateStr}
            onClick={() => onSelectDate(dateStr)}
            className={`shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl border transition-colors ${
              isSelected
                ? 'bg-amber text-charcoal border-amber'
                : 'bg-charcoal-raised text-offwhite/80 border-white/10 hover:border-amber/50'
            }`}
          >
            <span className="text-xs uppercase tracking-wide opacity-70">
              {WEEKDAY_LABELS[day.getDay()]}
            </span>
            <span className="text-xl font-display mt-0.5">{day.getDate()}</span>
          </button>
        );
      })}
    </div>
  );
}
