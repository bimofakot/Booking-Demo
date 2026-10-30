import { useEffect, useState } from 'react';
import type { Booking } from '@/types';
import { bookingService } from '@/services';

export function useMyBookings(userId: string | undefined) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setBookings([]);
      setLoading(false);
      return;
    }

    let alive = true;
    setLoading(true);

    const load = async () => {
      try {
        const next = await bookingService.listUserBookings();
        if (!alive) return;
        setBookings(next);
        setError(null);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat riwayat booking.');
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
  }, [userId]);

  return { bookings, loading, error };
}
