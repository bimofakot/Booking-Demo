import { useEffect, useState } from 'react';
import type { DaySchedule } from '@/types';
import { bookingService } from '@/services';

export function useSchedule(date: string) {
  const [schedule, setSchedule] = useState<DaySchedule | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;
    setLoading(true);
    setSchedule(null);
    setError(null);

    const load = async () => {
      try {
        const next = await bookingService.getSchedule(date);
        if (!alive) return;
        setSchedule(next);
        setError(null);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : 'Gagal memuat jadwal.');
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

  return { schedule, loading, error };
}
