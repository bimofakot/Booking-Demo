import { useEffect, useState } from 'react';
import type { Booking } from '@/types';
import { bookingService } from '@/services';

export function usePendingBookings(enabled: boolean) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!enabled) {
      setBookings([]);
      setLoading(false);
      setError(null);
      return;
    }

    let alive = true;

    const load = async () => {
      try {
        const next = await bookingService.listPendingBookings();
        if (!alive) return;
        setBookings(next);
        setError(null);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat booking pending.');
      } finally {
        if (alive) setLoading(false);
      }
    };

    void load();
    const unsubscribe = bookingService.subscribe(() => {
      void load();
    });
    const timer = window.setInterval(() => {
      void load();
    }, 60_000);

    return () => {
      alive = false;
      unsubscribe();
      window.clearInterval(timer);
    };
  }, [enabled]);

  return { bookings, loading, error };
}
