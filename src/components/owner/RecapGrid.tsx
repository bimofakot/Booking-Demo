import { CalendarCheck, Clock, Dumbbell, Feather } from 'lucide-react';
import type { Booking } from '@/types';
import { bookingPrice } from '@/lib/booking';
import { formatCurrency, formatNumber } from '@/lib/format';
import { Card } from '@/components/ui/Card';

interface RecapGridProps {
  bookings: Booking[];
}

export function RecapGrid({ bookings }: RecapGridProps) {
  const confirmed = bookings.filter((booking) => booking.status === 'confirmed');
  const hours = confirmed.reduce((total, booking) => total + booking.duration, 0);
  const shuttlecocks = confirmed.reduce(
    (total, booking) => total + (booking.shuttlecocks ?? 0),
    0,
  );
  const rackets = confirmed.reduce((total, booking) => total + (booking.rackets ?? 0), 0);
  const revenue = confirmed.reduce((total, booking) => total + bookingPrice(booking), 0);

  const stats = [
    { icon: CalendarCheck, label: 'Booking', value: formatNumber(confirmed.length), unit: 'terkonfirmasi' },
    { icon: Clock, label: 'Jam terjual', value: formatNumber(hours), unit: 'jam' },
    { icon: Feather, label: 'Kok', value: formatNumber(shuttlecocks), unit: 'buah' },
    { icon: Dumbbell, label: 'Raket', value: formatNumber(rackets), unit: 'buah' },
  ];

  return (
    <div>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label} className="p-4">
              <div className="flex items-center gap-2 text-slate-400">
                <span className="grid h-8 w-8 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wide">{stat.label}</span>
              </div>
              <p className="mt-2 text-2xl font-extrabold tabular-nums text-slate-900 dark:text-white">
                {stat.value}
              </p>
              <p className="text-[11px] font-medium text-slate-400">{stat.unit}</p>
            </Card>
          );
        })}
      </div>
      <p className="mt-2 text-right text-[11px] text-slate-400">
        Estimasi pendapatan terkonfirmasi: <span className="font-bold text-slate-500 dark:text-slate-300">{formatCurrency(revenue)}</span>
      </p>
    </div>
  );
}
