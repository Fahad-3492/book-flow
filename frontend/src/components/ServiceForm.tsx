import { useState, type FormEvent } from 'react';
import type { Service } from '../types';
import type { ServiceFormInput } from '../hooks/useAdminServices';

interface ServiceFormProps {
  initial?: Service;
  onSubmit: (input: ServiceFormInput) => Promise<void>;
  onCancel: () => void;
}

export function ServiceForm({ initial, onSubmit, onCancel }: ServiceFormProps) {
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [price, setPrice] = useState(initial ? String(initial.price) : '');
  const [durationMinutes, setDurationMinutes] = useState(
    initial ? String(initial.duration_minutes) : '30'
  );
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const priceNum = Number(price);
    const durationNum = Number(durationMinutes);
    if (!name.trim()) return setError('Name is required.');
    if (Number.isNaN(priceNum) || priceNum < 0) return setError('Price must be 0 or greater.');
    if (Number.isNaN(durationNum) || durationNum < 5) return setError('Duration must be at least 5 minutes.');

    setIsSaving(true);
    try {
      await onSubmit({ name: name.trim(), description: description.trim(), price: priceNum, durationMinutes: durationNum });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not save service.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-charcoal-raised border border-amber/30 rounded-xl p-5 space-y-3">
      <div>
        <label className="block text-xs uppercase tracking-widest text-offwhite/50 mb-1.5">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-offwhite focus-visible:border-amber outline-none"
        />
      </div>

      <div>
        <label className="block text-xs uppercase tracking-widest text-offwhite/50 mb-1.5">
          Description
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-offwhite focus-visible:border-amber outline-none resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs uppercase tracking-widest text-offwhite/50 mb-1.5">
            Price (USD)
          </label>
          <input
            type="number"
            min="0"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-offwhite focus-visible:border-amber outline-none"
          />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-widest text-offwhite/50 mb-1.5">
            Duration (min)
          </label>
          <input
            type="number"
            min="5"
            step="5"
            value={durationMinutes}
            onChange={(e) => setDurationMinutes(e.target.value)}
            className="w-full bg-charcoal border border-white/10 rounded-lg px-3 py-2 text-offwhite focus-visible:border-amber outline-none"
          />
        </div>
      </div>

      {error && <p className="text-rust text-sm">{error}</p>}

      <div className="flex gap-2 pt-1">
        <button
          type="submit"
          disabled={isSaving}
          className="bg-amber hover:bg-amber-bright disabled:opacity-50 text-charcoal font-semibold text-sm px-4 py-2 rounded-lg transition-colors"
        >
          {isSaving ? 'Saving…' : 'Save'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-offwhite/60 hover:text-offwhite text-sm px-4 py-2 transition-colors"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
