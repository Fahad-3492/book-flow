import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAdminStats } from '../hooks/useAdminStats';
import { useAdminBookings } from '../hooks/useAdminBookings';
import { useAdminServices } from '../hooks/useAdminServices';
import { StatCard } from '../components/StatCard';
import { AdminBookingRow } from '../components/AdminBookingRow';
import { ServiceForm } from '../components/ServiceForm';
import { LoadingState, ErrorState, EmptyState } from '../components/StateDisplays';
import { formatPrice, formatDuration } from '../lib/format';
import type { Service } from '../types';

type Tab = 'bookings' | 'services';

export function AdminPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('bookings');

  if (!user) {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16">
        <p className="text-offwhite/60">
          <Link to="/login" className="text-amber hover:underline">
            Log in
          </Link>{' '}
          to view this page.
        </p>
      </main>
    );
  }

  if (user.role !== 'admin') {
    return (
      <main className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="font-display text-3xl text-offwhite mb-2">Admins only</h1>
        <p className="text-offwhite/60">This page is restricted to admin accounts.</p>
      </main>
    );
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl text-offwhite mb-8">Admin dashboard</h1>

      <StatsRow />

      <div className="flex gap-1 border-b border-white/10 mb-6 mt-10">
        <TabButton active={tab === 'bookings'} onClick={() => setTab('bookings')}>
          Bookings
        </TabButton>
        <TabButton active={tab === 'services'} onClick={() => setTab('services')}>
          Services
        </TabButton>
      </div>

      {tab === 'bookings' ? <BookingsTab /> : <ServicesTab />}
    </main>
  );
}

function TabButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
        active ? 'border-amber text-offwhite' : 'border-transparent text-offwhite/50 hover:text-offwhite/80'
      }`}
    >
      {children}
    </button>
  );
}

function StatsRow() {
  const { stats, isLoading, error } = useAdminStats();

  if (isLoading) return <LoadingState label="Loading stats…" />;
  if (error) return <ErrorState message={error} />;
  if (!stats) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <StatCard label="Total revenue" value={formatPrice(stats.totalRevenue)} accent />
      <StatCard label="Today" value={stats.bookingsToday} />
      <StatCard label="Pending" value={stats.statusCounts.pending} />
      <StatCard label="Confirmed" value={stats.statusCounts.confirmed} />
    </div>
  );
}

function BookingsTab() {
  const { bookings, isLoading, error, updateStatus } = useAdminBookings();

  if (isLoading) return <LoadingState label="Loading bookings…" />;
  if (error) return <ErrorState message={error} />;
  if (bookings.length === 0) {
    return <EmptyState title="No bookings yet." hint="They'll show up here once customers book." />;
  }

  return (
    <div className="space-y-3">
      {bookings.map((booking) => (
        <AdminBookingRow
          key={booking.id}
          booking={booking}
          onUpdateStatus={(status) => updateStatus(booking.id, status)}
        />
      ))}
    </div>
  );
}

function ServicesTab() {
  const { services, isLoading, error, createService, updateService, deactivateService } =
    useAdminServices();
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  if (isLoading) return <LoadingState label="Loading services…" />;
  if (error) return <ErrorState message={error} />;

  return (
    <div className="space-y-3">
      {!isCreating && (
        <button
          onClick={() => setIsCreating(true)}
          className="text-sm font-medium text-amber border border-amber/40 hover:bg-amber/10 px-4 py-2 rounded-lg transition-colors mb-2"
        >
          + Add service
        </button>
      )}

      {isCreating && (
        <ServiceForm
          onSubmit={async (input) => {
            await createService(input);
            setIsCreating(false);
          }}
          onCancel={() => setIsCreating(false)}
        />
      )}

      {services.length === 0 && !isCreating && (
        <EmptyState title="No services yet." hint="Add one to start taking bookings." />
      )}

      {services.map((service) =>
        editingId === service.id ? (
          <ServiceForm
            key={service.id}
            initial={service}
            onSubmit={async (input) => {
              await updateService(service.id, input);
              setEditingId(null);
            }}
            onCancel={() => setEditingId(null)}
          />
        ) : (
          <ServiceRow
            key={service.id}
            service={service}
            onEdit={() => setEditingId(service.id)}
            onDeactivate={() => deactivateService(service.id)}
          />
        )
      )}
    </div>
  );
}

function ServiceRow({
  service,
  onEdit,
  onDeactivate,
}: {
  service: Service;
  onEdit: () => void;
  onDeactivate: () => void;
}) {
  return (
    <div className="bg-charcoal-raised border border-white/10 rounded-xl p-5 flex items-center justify-between gap-4 flex-wrap">
      <div>
        <div className="flex items-center gap-2">
          <h3 className="font-display text-lg text-offwhite">{service.name}</h3>
          {service.is_active === false && (
            <span className="text-xs text-offwhite/40 border border-white/10 px-2 py-0.5 rounded-full">
              Inactive
            </span>
          )}
        </div>
        <p className="text-sm text-offwhite/50 mt-0.5">
          {formatDuration(service.duration_minutes)} · {formatPrice(service.price)}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          onClick={onEdit}
          className="text-sm font-medium text-offwhite/70 border border-white/10 hover:border-white/30 px-3.5 py-2 rounded-lg transition-colors"
        >
          Edit
        </button>
        {service.is_active !== false && (
          <button
            onClick={onDeactivate}
            className="text-sm font-medium text-rust border border-rust/30 hover:bg-rust/10 px-3.5 py-2 rounded-lg transition-colors"
          >
            Deactivate
          </button>
        )}
      </div>
    </div>
  );
}
