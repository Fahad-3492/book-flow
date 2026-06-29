import { useNavigate } from 'react-router-dom';
import { useServices } from '../hooks/useServices';
import { ServiceCard } from '../components/ServiceCard';
import { HeroBookingPreview } from '../components/HeroBookingPreview';
import { LoadingState, ErrorState, EmptyState } from '../components/StateDisplays';
import type { Service } from '../types';

export function LandingPage() {
  const { services, isLoading, error } = useServices();
  const navigate = useNavigate();

  function goToService(service: Service) {
    navigate(`/services/${service.id}`);
  }

  return (
    <main>
      <section className="max-w-6xl mx-auto px-6 pt-16 pb-20 grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-xs uppercase tracking-widest text-amber mb-4">Book online</p>
          <h1 className="font-display text-5xl sm:text-6xl leading-[1.05] text-offwhite mb-6">
            Pick a time.
            <br />
            Show up.
            <br />
            That's it.
          </h1>
          <p className="text-offwhite/60 text-lg max-w-md leading-relaxed">
            No phone calls, no back-and-forth. Browse what's offered, see real open
            slots, and book in under a minute.
          </p>
        </div>

        <div className="flex justify-center lg:justify-end">
          {isLoading ? (
            <LoadingState label="Loading services…" />
          ) : services.length > 0 ? (
            <HeroBookingPreview services={services} onPickService={goToService} />
          ) : null}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-6 pb-24">
        <h2 className="font-display text-3xl text-offwhite mb-8">Everything on offer</h2>

        {isLoading && <LoadingState label="Loading services…" />}
        {error && <ErrorState message={error} />}
        {!isLoading && !error && services.length === 0 && (
          <EmptyState
            title="No services available right now."
            hint="Check back soon, or contact us directly to book."
          />
        )}

        {!isLoading && !error && services.length > 0 && (
          <div className="grid sm:grid-cols-2 gap-4">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} onSelect={goToService} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
