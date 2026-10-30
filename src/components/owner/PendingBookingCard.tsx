import { Check, Clock, X } from 'lucide-react';
import type { Booking } from '@/types';
import { bookingCode, bookingPrice } from '@/lib/booking';
import {
  formatDateLong,
  formatDateTimeWib,
  formatRemaining,
  formatTimeRange,
} from '@/lib/datetime';
import { formatCurrency } from '@/lib/format';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface PendingBookingCardProps {
  booking: Booking;
  nowMs: number;
  busy: boolean;
  onAccept: () => void;
  onReject: () => void;
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-semibold text-slate-400">{label}</p>
      <p className="mt-0.5 text-sm font-extrabold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
  );
}

export function PendingBookingCard({
  booking,
  nowMs,
  busy,
  onAccept,
  onReject,
}: PendingBookingCardProps) {
  const remaining = formatRemaining(booking.expiresAt, nowMs);

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20">
              Perlu verifikasi
            </span>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {bookingCode(booking.id)}
            </span>
          </div>
          <h3 className="mt-1.5 text-base font-extrabold text-slate-900 dark:text-white">
            {booking.userName}
          </h3>
          {booking.userEmail && (
            <p className="text-xs text-slate-400">{booking.userEmail}</p>
          )}
          <p className="mt-1 text-sm font-semibold text-slate-600 dark:text-slate-300">
            {formatDateLong(booking.date)}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {formatTimeRange(booking.startHour, booking.duration)} WIB · {booking.duration} jam
          </p>
        </div>
        <div className="text-right">
          <p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">Diajukan</p>
          <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            {formatDateTimeWib(booking.createdAt)}
          </p>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-950/50 sm:grid-cols-4">
        <MiniStat label="Durasi" value={`${booking.duration} jam`} />
        <MiniStat
          label="Kok"
          value={booking.shuttlecocks !== undefined ? String(booking.shuttlecocks) : '-'}
        />
        <MiniStat
          label="Raket"
          value={booking.rackets !== undefined ? String(booking.rackets) : '-'}
        />
        <MiniStat label="Total" value={formatCurrency(bookingPrice(booking))} />
      </div>

      {booking.note && (
        <p className="mt-3 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs leading-relaxed text-slate-500 dark:border-slate-800 dark:bg-slate-950/30 dark:text-slate-400">
          “{booking.note}”
        </p>
      )}

      <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
        <Clock className="h-3.5 w-3.5" />
        {remaining ? `Kadaluarsa dalam ${remaining}` : 'Segera kadaluarsa'}
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <Button onClick={onAccept} disabled={busy} className="sm:flex-1">
          <Check className="h-4 w-4" />
          Terima
        </Button>
        <Button
          variant="dangerOutline"
          onClick={onReject}
          disabled={busy}
          className="sm:flex-1"
        >
          <X className="h-4 w-4" />
          Tolak
        </Button>
      </div>
    </Card>
  );
}
