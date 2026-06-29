import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ApiRequestError } from '../lib/api';

export function SignupPage() {
  const { signup } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await signup(name, email, password);
      navigate('/');
    } catch (err) {
      setError(err instanceof ApiRequestError ? err.message : 'Something went wrong. Try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-20">
      <h1 className="font-display text-3xl text-offwhite mb-8">Create an account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm text-offwhite/70 mb-1.5">
            Name
          </label>
          <input
            id="name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-charcoal-raised border border-white/10 rounded-lg px-3.5 py-2.5 text-offwhite focus-visible:border-amber outline-none"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm text-offwhite/70 mb-1.5">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-charcoal-raised border border-white/10 rounded-lg px-3.5 py-2.5 text-offwhite focus-visible:border-amber outline-none"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm text-offwhite/70 mb-1.5">
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-charcoal-raised border border-white/10 rounded-lg px-3.5 py-2.5 text-offwhite focus-visible:border-amber outline-none"
          />
          <p className="text-xs text-offwhite/40 mt-1">At least 8 characters.</p>
        </div>

        {error && <p className="text-rust text-sm">{error}</p>}

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-amber hover:bg-amber-bright disabled:opacity-50 text-charcoal font-semibold py-2.5 rounded-lg transition-colors"
        >
          {isSubmitting ? 'Creating account…' : 'Sign up'}
        </button>
      </form>

      <p className="text-sm text-offwhite/50 mt-6">
        Already have an account?{' '}
        <Link to="/login" className="text-amber hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
