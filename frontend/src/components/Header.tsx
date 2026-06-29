import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export function Header() {
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <Link to="/" className="font-display text-2xl text-offwhite">
          BookFlow
        </Link>

        <nav className="flex items-center gap-6 text-sm">
          {user ? (
            <>
              <Link to="/my-bookings" className="text-offwhite/70 hover:text-offwhite transition-colors">
                My bookings
              </Link>
              {user.role === 'admin' && (
                <Link to="/admin" className="text-offwhite/70 hover:text-offwhite transition-colors">
                  Admin
                </Link>
              )}
              <button onClick={logout} className="text-offwhite/70 hover:text-offwhite transition-colors">
                Log out
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-offwhite/70 hover:text-offwhite transition-colors">
                Log in
              </Link>
              <Link
                to="/signup"
                className="bg-amber hover:bg-amber-bright text-charcoal font-medium px-4 py-2 rounded-lg transition-colors"
              >
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
