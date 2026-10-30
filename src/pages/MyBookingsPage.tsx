import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Ban, CalendarDays, Info, Loader2 } from 'lucide-react';
import type { Booking } from '@/types';
import { bookingService } from '@/services';
import { useAuth } from '@/context/AuthContext';
import { useMyBookings } from '@/hooks/useMyBookings';
import { useNow } from '@/hooks/useNow';
import { bookingCode } from '@/lib/booking';
import { MAX_PENDING_BOOKINGS } from '@/lib/constants';
import { formatDateLong, formatTimeRange } from '@/lib/datetime';
import { isOwnerWhatsAppConfigured } from '@/lib/whatsapp';
import { Alert } from '@/components/ui/Alert';
import { Button, buttonClasses } from '@/components/ui/Button';
import { EmptyState } from '@/components/ui/EmptyState';
import { LoadingState } from '@/components/ui/LoadingState';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { BookingCard } from '@/components/booking/BookingCard';

export default function MyBookingsPage() {
  const { user } = useAuth();
  const { bookings, loading, error } = useMyBookings(user?.id);
  const now = useNow(30_000);

  const [cancelTarget, setCancelTarget] = useState<Booking | null>(null);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const pendingCount = bookings.filter((booking) => booking.status === 'pending').length;

  async function handleCancel() {
    if (!cancelTarget || cancelling) return;
    setCancelling(true);
    setCancelError(null);

    try {
      await bookingService.cancelBooking(cancelTarget.id);
      setCancelTarget(null);
      setNotice('Booking berhasil dibatalkan. Slot sudah tersedia kembali.');
    } catch (err) {
      setCancelError(err instanceof Error ? err.message : 'Gagal membatalkan booking.');
    } finally {
      setCancelling(false);
    }
  }

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Akun saya"
        title="Riwayat booking"
        description="Pantau status permintaan, batalkan booking pending, atau hubungi owner lewat WhatsApp."
        actions={
          <Link to="/" className={buttonClasses({ variant: 'outline', size: 'md' })}>
            <CalendarDays className="h-4 w-4" />
            Pesan lagi
          </Link>
        }
      />

      <div className="flex items-start gap-2.5 rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-3 text-xs leading-relaxed text-brand-800 dark:border-brand-500/20 dark:bg-brand-500/10 dark:text-brand-200">
        <Info className="mt-0.5 h-4 w-4 shrink-0" />
        <span>
          Slot pending terpakai: <strong>{pendingCount}</strong> dari{' '}
          <strong>{MAX_PENDING_BOOKINGS}</strong>. Booking pending otomatis kadaluarsa setelah 3
          jam atau saat jam mulai, mana yang lebih dulu.
        </span>
      </div>

      {notice && <Alert tone="success">{notice}</Alert>}
      {!isOwnerWhatsAppConfigured() && (
        <Alert tone="warning">
          Nomor WhatsApp owner belum diatur. Isi <code>VITE_OWNER_WHATSAPP</code> di file{' '}
          <code>.env</code> lalu jalankan ulang server agar tombol WhatsApp mengarah ke nomor
          yang benar.
        </Alert>
      )}
      {error && <Alert tone="error">{error}</Alert>}

      {loading ? (
        <LoadingState label="Memuat riwayat booking..." />
      ) : bookings.length === 0 ? (
        <EmptyState
          icon={<CalendarDays className="h-5 w-5" />}
          title="Belum ada booking"
          description="Pilih jam yang masih hijau di halaman jadwal untuk mengajukan booking pertamamu."
          action={
            <Link to="/" className={buttonClasses({ size: 'md' })}>
              Lihat jadwal
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              nowMs={now.getTime()}
              onRequestCancel={() => {
                setCancelTarget(booking);
                setCancelError(null);
              }}
            />
          ))}
        </div>
      )}

      <Modal
        open={cancelTarget !== null}
        onClose={() => {
          if (!cancelling) setCancelTarget(null);
        }}
        title="Batalkan booking?"
        description="Slot akan langsung tersedia kembali untuk pengguna lain."
        icon={<Ban className="h-5 w-5" />}
      >
        {cancelTarget && (
          <div className="space-y-4">
            <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950/40">
              <p className="font-bold text-slate-800 dark:text-slate-100">
                {formatDateLong(cancelTarget.date)}
              </p>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                {formatTimeRange(cancelTarget.startHour, cancelTarget.duration)} WIB ·{' '}
                {cancelTarget.duration} jam
              </p>
              <p className="mt-1 font-mono text-[10px] text-slate-400">
                {bookingCode(cancelTarget.id)}
              </p>
            </div>

            {cancelError && <Alert tone="error">{cancelError}</Alert>}

            <div className="flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                variant="outline"
                onClick={() => setCancelTarget(null)}
                disabled={cancelling}
                className="sm:flex-1"
              >
                Kembali
              </Button>
              <Button
                variant="danger"
                onClick={() => void handleCancel()}
                disabled={cancelling}
                className="sm:flex-1"
              >
                {cancelling ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Ban className="h-4 w-4" />
                )}
                {cancelling ? 'Membatalkan...' : 'Ya, batalkan'}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
