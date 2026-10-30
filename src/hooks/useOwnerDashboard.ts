import { useEffect, useState } from 'react';
import type { Booking, DaySchedule } from '@/types';
import { bookingService } from '@/services';

export function useOwnerDashboard(date: string) {
  const [pending, setPending] = useState<Booking[]>([]);
  const [dayBookings, setDayBookings] = useState<Booking[]>([]);
  const [schedule, setSchedule] = useState<DaySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);

    const load = async () => {
      try {
        const [pendingResult, dayResult, scheduleResult] = await Promise.all([
          bookingService.listPendingBookings(),
          bookingService.listBookingsByDate(date),
          bookingService.getSchedule(date),
        ]);
        if (!alive) return;
        setPending(pendingResult);
        setDayBookings(dayResult);
        setSchedule(scheduleResult);
        setError(null);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat data dashboard.');
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
  }, [date]);

  return { pending, dayBookings, schedule, loading, error };
}
