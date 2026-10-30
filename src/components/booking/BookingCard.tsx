import { Ban, Clock, MessageCircle } from 'lucide-react';
import type { Booking } from '@/types';
import { bookingCode, bookingPrice } from '@/lib/booking';
import {
  formatDateLong,
  formatDateTimeWib,
  formatRemaining,
  formatTimeRange,
  relativeDayLabel,
} from '@/lib/datetime';
import { formatCurrency } from '@/lib/format';
import { buildBookingWhatsAppUrl } from '@/lib/whatsapp';
import { Alert } from '@/components/ui/Alert';
import { BookingStatusBadge } from '@/components/ui/Badge';
import { Button, buttonClasses } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface BookingCardProps {
  booking: Booking;
  nowMs: number;
  onRequestCancel: () => void;
}

export function BookingCard({ booking, nowMs, onRequestCancel }: BookingCardProps) {
  const remaining = formatRemaining(booking.expiresAt, nowMs);
  const canChat = booking.status === 'pending' || booking.status === 'confirmed';

  return (
    <Card className="p-4 sm:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-300">
              {relativeDayLabel(booking.date)}
            </span>
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-mono text-[10px] font-semibold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {bookingCode(booking.id)}
            </span>
          </div>
          <h3 className="mt-1 text-base font-extrabold text-slate-900 dark:text-white">
            {formatDateLong(booking.date)}
          </h3>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            {formatTimeRange(booking.startHour, booking.duration)} WIB · {booking.duration} jam
          </p>
        </div>
        <BookingStatusBadge status={booking.status} />
      </div>

      <dl className="mt-4 grid grid-cols-2 gap-3 rounded-xl bg-slate-50 p-3 text-xs dark:bg-slate-950/50 sm:grid-cols-4">
        <div>
          <dt className="font-semibold text-slate-400">Total</dt>
          <dd className="mt-0.5 text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {formatCurrency(bookingPrice(booking))}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-400">Kok</dt>
          <dd className="mt-0.5 text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {booking.shuttlecocks ?? '-'}
          </dd>
        </div>
        <div>
          <dt className="font-semibold text-slate-400">Raket</dt>
          <dd className="mt-0.5 text-sm font-extrabold text-slate-800 dark:text-slate-100">
            {booking.rackets ?? '-'}
          </dd>
        </div>
        <div className="col-span-2 sm:col-span-1">
          <dt className="font-semibold text-slate-400">Diajukan</dt>
          <dd className="mt-0.5 text-[11px] font-semibold text-slate-600 dark:text-slate-300">
            {formatDateTimeWib(booking.createdAt)}
          </dd>
        </div>
      </dl>

      {booking.note && (
        <p className="mt-3 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
          <span className="font-bold text-slate-600 dark:text-slate-300">Catatan: </span>
          {booking.note}
        </p>
      )}

      {booking.status === 'rejected' && (
        <Alert tone="error" className="mt-3">
          {booking.rejectionReason
            ? `Alasan penolakan: ${booking.rejectionReason}`
            : 'Booking ditolak owner. Slot sudah tersedia kembali untuk dipesan.'}
        </Alert>
      )}

      {booking.status === 'pending' && (
        <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-700 dark:text-amber-300">
          <Clock className="h-3.5 w-3.5" />
          {remaining ? `Kadaluarsa dalam ${remaining}` : 'Segera kadaluarsa'}
        </div>
      )}

      {(booking.status === 'pending' || canChat) && (
        <div className="mt-4 flex flex-wrap gap-2">
          {booking.status === 'pending' && (
            <Button variant="dangerOutline" size="sm" onClick={onRequestCancel}>
              <Ban className="h-3.5 w-3.5" />
              Batalkan
            </Button>
          )}
          {canChat && (
            <a
              href={buildBookingWhatsAppUrl(booking)}
              target="_blank"
              rel="noreferrer"
              className={buttonClasses({ variant: 'secondary', size: 'sm' })}
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Tanya konfirmasi via WhatsApp
            </a>
          )}
        </div>
      )}
    </Card>
  );
}
