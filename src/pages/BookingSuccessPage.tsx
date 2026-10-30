import { useCallback, useEffect, useState, type ReactNode } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  CircleCheck,
  CircleX,
  Clock,
  Info,
  MessageCircle,
  Wallet,
} from 'lucide-react';
import type { Booking, BookingStatus } from '@/types';
import { bookingService } from '@/services';
import { useNow } from '@/hooks/useNow';
import { bookingCode, bookingPrice } from '@/lib/booking';
import {
  formatDateLong,
  formatDateTimeWib,
  formatRemaining,
  formatTimeRange,
} from '@/lib/datetime';
import { formatCurrency } from '@/lib/format';
import {
  buildBookingWhatsAppUrl,
  isOwnerWhatsAppConfigured,
} from '@/lib/whatsapp';
import { cn } from '@/lib/cn';
import { Alert } from '@/components/ui/Alert';
import { BookingStatusBadge } from '@/components/ui/Badge';
import { buttonClasses } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';

const statusCopy: Record<BookingStatus, { title: string; subtitle: string }> = {
  pending: {
    title: 'Permintaan terkirim',
    subtitle: 'Slot sudah dikunci sementara menunggu verifikasi owner.',
  },
  confirmed: {
    title: 'Booking terkonfirmasi',
    subtitle: 'Owner sudah menerima booking ini. Sampai jumpa di lapangan.',
  },
  rejected: {
    title: 'Booking ditolak',
    subtitle: 'Owner tidak dapat menerima permintaan ini.',
  },
  cancelled: {
    title: 'Booking dibatalkan',
    subtitle: 'Booking ini sudah dibatalkan dan slot kembali tersedia.',
  },
  expired: {
    title: 'Booking kadaluarsa',
    subtitle: 'Batas waktu verifikasi terlewat sehingga slot dilepas otomatis.',
  },
};

function StatusIcon({ status }: { status: BookingStatus }) {
  const Icon =
    status === 'confirmed'
      ? CircleCheck
      : status === 'rejected'
        ? CircleX
        : status === 'pending'
          ? Clock
          : Info;
  return (
    <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-white/15 ring-4 ring-white/10">
      <Icon className="h-7 w-7" />
    </span>
  );
}

function DetailRow({
  label,
  children,
  strong,
}: {
  label: string;
  children: ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5">
      <dt className="text-slate-500 dark:text-slate-400">{label}</dt>
      <dd
        className={cn(
          'text-right font-semibold text-slate-800 dark:text-slate-100',
          strong && 'text-base font-extrabold text-brand-700 dark:text-brand-300',
        )}
      >
        {children}
      </dd>
    </div>
  );
}

export default function BookingSuccessPage() {
  const { id } = useParams<{ id: string }>();
  const now = useNow(15_000);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!id) {
      setError('Booking tidak ditemukan.');
      setLoading(false);
      return;
    }

    try {
      const result = await bookingService.getBooking(id);
      if (result) {
        setBooking(result);
        setError(null);
      } else {
        setError('Booking tidak ditemukan.');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat booking.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
    const unsubscribe = bookingService.subscribe(() => {
      void load();
    });
    const timer = window.setInterval(() => {
      void load();
    }, 30_000);

    return () => {
      unsubscribe();
      window.clearInterval(timer);
    };
  }, [load]);

  if (loading) {
    return <LoadingState label="Memuat detail booking..." />;
  }

  if (!booking || error) {
    return (
      <EmptyState
        icon={<Info className="h-5 w-5" />}
        title="Booking tidak tersedia"
        description={error ?? 'Data booking tidak ditemukan atau bukan milik akun ini.'}
        action={
          <Link to="/booking-saya" className={buttonClasses({ size: 'md' })}>
            Lihat riwayat booking
          </Link>
        }
      />
    );
  }

  const copy = statusCopy[booking.status];
  const remaining = formatRemaining(booking.expiresAt, now.getTime());
  const configured = isOwnerWhatsAppConfigured();

  return (
    <div className="mx-auto w-full max-w-xl">
      <div className="mb-4">
        <Link
          to="/"
          className={buttonClasses({ variant: 'ghost', size: 'sm', className: '-ml-2' })}
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali ke jadwal
        </Link>
      </div>

      <Card className="overflow-hidden">
        <div className="relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-700 to-emerald-600 px-6 pb-6 pt-8 text-center text-white">
          <div className="pointer-events-none absolute -right-10 -top-16 h-40 w-40 rounded-full border-[16px] border-white/[0.07]" />
          <div className="relative">
            <StatusIcon status={booking.status} />
            <h1 className="mt-3 text-xl font-extrabold tracking-tight">{copy.title}</h1>
            <p className="mx-auto mt-1 max-w-sm text-sm leading-relaxed text-white/80">
              {copy.subtitle}
            </p>
            <span className="mt-3 inline-flex rounded-full bg-white/15 px-3 py-1 font-mono text-[11px] font-bold tracking-wide">
              {bookingCode(booking.id)}
            </span>
          </div>
        </div>

        <div className="space-y-4 p-5 sm:p-6">
          <div className="flex items-center justify-between gap-3">
            <BookingStatusBadge status={booking.status} />
            <span className="text-[11px] text-slate-400">
              Diajukan {formatDateTimeWib(booking.createdAt)}
            </span>
          </div>

          {booking.status === 'pending' && (
            <Alert tone="warning" title="Menunggu verifikasi owner">
              {remaining
                ? `Slot dikunci sementara. Booking akan kadaluarsa dalam ${remaining} (${formatDateTimeWib(booking.expiresAt)}).`
                : 'Booking ini akan segera kadaluarsa. Hubungi owner lewat WhatsApp untuk mempercepat verifikasi.'}
            </Alert>
          )}

          {booking.status === 'confirmed' && (
            <Alert tone="success" title="Sudah dikonfirmasi">
              Datang sesuai jadwal dan bayar di tempat. Pembayaran dihitung dari durasi yang
              dibooking, bukan jam pemakaian.
            </Alert>
          )}

          {booking.status === 'rejected' && (
            <Alert tone="error" title="Alasan penolakan">
              {booking.rejectionReason ||
                'Owner menolak permintaan ini. Silakan pilih jam lain di halaman jadwal.'}
            </Alert>
          )}

          {booking.status === 'expired' && (
            <Alert tone="warning">
              Booking tidak diverifikasi sebelum batas waktu, sehingga slot dilepas otomatis.
            </Alert>
          )}

          {booking.status === 'cancelled' && (
            <Alert tone="info">Booking ini sudah dibatalkan. Slot kembali tersedia.</Alert>
          )}

          <dl className="divide-y divide-slate-100 border-y border-slate-100 text-sm dark:divide-slate-800 dark:border-slate-800">
            <DetailRow label="Tanggal">{formatDateLong(booking.date)}</DetailRow>
            <DetailRow label="Jam">
              {formatTimeRange(booking.startHour, booking.duration)} WIB
            </DetailRow>
            <DetailRow label="Durasi">{booking.duration} jam</DetailRow>
            <DetailRow label="Jumlah kok">{booking.shuttlecocks ?? '-'}</DetailRow>
            <DetailRow label="Jumlah raket">{booking.rackets ?? '-'}</DetailRow>
            <DetailRow label="Total bayar di tempat" strong>
              {formatCurrency(bookingPrice(booking))}
            </DetailRow>
          </dl>

          {booking.note && (
            <div className="rounded-xl bg-slate-50 p-3 text-xs leading-relaxed text-slate-500 dark:bg-slate-950/40 dark:text-slate-400">
              <span className="font-bold text-slate-600 dark:text-slate-300">Catatan: </span>
              {booking.note}
            </div>
          )}

          <div className="flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-slate-500 dark:bg-slate-950/40 dark:text-slate-400">
            <Wallet className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Tanpa DP. Pembayaran dilakukan langsung di GOR saat datang.
          </div>

          <div className="space-y-2">
            <a
              href={buildBookingWhatsAppUrl(booking)}
              target="_blank"
              rel="noreferrer"
              className={buttonClasses({
                variant: 'whatsapp',
                size: 'lg',
                className: 'w-full',
              })}
            >
              <MessageCircle className="h-4 w-4" />
              Konfirmasi via WhatsApp
            </a>
            {!configured && (
              <p className="text-[11px] leading-relaxed text-amber-600 dark:text-amber-400">
                Nomor WhatsApp owner masih placeholder. Isi VITE_OWNER_WHATSAPP di file .env
                agar tombol ini membuka chat yang benar.
              </p>
            )}

            <div className="grid grid-cols-2 gap-2">
              <Link
                to="/booking-saya"
                className={buttonClasses({ variant: 'outline', size: 'md', className: 'w-full' })}
              >
                Lihat riwayat
              </Link>
              <Link
                to="/"
                className={buttonClasses({ variant: 'ghost', size: 'md', className: 'w-full' })}
              >
                Jadwal lain
              </Link>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
