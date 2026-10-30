import { useEffect, useRef, useState, type FormEvent } from 'react';
import { Bell, BellOff, CircleCheck, Loader2, X } from 'lucide-react';
import type { Booking } from '@/types';
import { bookingService } from '@/services';
import { useNow } from '@/hooks/useNow';
import { useOwnerDashboard } from '@/hooks/useOwnerDashboard';
import { bookingCode, bookingPrice } from '@/lib/booking';
import {
  formatDateLong,
  formatHour,
  formatTimeRange,
  relativeDayLabel,
  todayWIB,
} from '@/lib/datetime';
import { formatCurrency } from '@/lib/format';
import {
  isSoundEnabled,
  playBookingChime,
  setSoundEnabled as saveSoundPreference,
} from '@/lib/sound';
import { Alert } from '@/components/ui/Alert';
import { BookingStatusBadge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { FormField, textareaClasses } from '@/components/ui/FormField';
import { LoadingState } from '@/components/ui/LoadingState';
import { Modal } from '@/components/ui/Modal';
import { PageHeader } from '@/components/ui/PageHeader';
import { DateNav } from '@/components/booking/DateNav';
import { PendingBookingCard } from '@/components/owner/PendingBookingCard';
import { RecapGrid } from '@/components/owner/RecapGrid';
import { SlotControl } from '@/components/owner/SlotControl';

export default function OwnerDashboardPage() {
  const [date, setDate] = useState(todayWIB);
  const { pending, dayBookings, schedule, loading, error } = useOwnerDashboard(date);
  const now = useNow(30_000);

  const [busyId, setBusyId] = useState<string | null>(null);
  const [busyHour, setBusyHour] = useState<number | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionInfo, setActionInfo] = useState<string | null>(null);

  const [rejectTarget, setRejectTarget] = useState<Booking | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState(false);

  const [soundEnabled, setSoundEnabled] = useState(isSoundEnabled);
  const [alertBooking, setAlertBooking] = useState<Booking | null>(null);
  const knownPendingIds = useRef<Set<string> | null>(null);

  useEffect(() => {
    if (loading) return;
    const ids = new Set(pending.map((booking) => booking.id));
    const previous = knownPendingIds.current;

    if (previous) {
      const fresh = pending.find((booking) => !previous.has(booking.id));
      if (fresh) {
        setAlertBooking(fresh);
        if (soundEnabled) playBookingChime();
      }
    }

    knownPendingIds.current = ids;
  }, [pending, loading, soundEnabled]);

  useEffect(() => {
    if (!alertBooking) return;
    const timer = window.setTimeout(() => setAlertBooking(null), 8000);
    return () => window.clearTimeout(timer);
  }, [alertBooking]);

  useEffect(() => {
    if (!actionInfo) return;
    const timer = window.setTimeout(() => setActionInfo(null), 4000);
    return () => window.clearTimeout(timer);
  }, [actionInfo]);

  function toggleSound() {
    const next = !soundEnabled;
    setSoundEnabled(next);
    saveSoundPreference(next);
    if (next) playBookingChime();
  }

  async function handleAccept(booking: Booking) {
    setActionError(null);
    setActionInfo(null);
    setBusyId(booking.id);

    try {
      await bookingService.confirmBooking(booking.id);
      setActionInfo(`Booking ${booking.userName} diterima.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal menerima booking.');
    } finally {
      setBusyId(null);
    }
  }

  function openReject(booking: Booking) {
    setRejectTarget(booking);
    setRejectReason('');
    setRejectError(null);
  }

  async function handleReject(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!rejectTarget || rejecting) return;

    setRejecting(true);
    setRejectError(null);
    try {
      await bookingService.rejectBooking(
        rejectTarget.id,
        rejectReason.trim() || undefined,
      );
      setActionInfo(`Booking ${rejectTarget.userName} ditolak. Slot kembali tersedia.`);
      setRejectTarget(null);
    } catch (err) {
      setRejectError(err instanceof Error ? err.message : 'Gagal menolak booking.');
    } finally {
      setRejecting(false);
    }
  }

  async function handleToggleSlot(hour: number, closed: boolean) {
    setActionError(null);
    setBusyHour(hour);

    try {
      await bookingService.setSlotClosed(date, hour, closed);
      setActionInfo(`Slot ${formatHour(hour)} ${closed ? 'ditutup' : 'dibuka'}.`);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal mengubah slot.');
    } finally {
      setBusyHour(null);
    }
  }

  if (loading && !schedule && pending.length === 0 && dayBookings.length === 0) {
    return <LoadingState label="Memuat dashboard owner..." />;
  }

  return (
    <div className="space-y-7">
      <PageHeader
        eyebrow="Panel pengelola"
        title="Dashboard owner"
        description="Verifikasi booking, pantau operasional harian, dan atur slot lapangan."
        actions={
          <>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-brand-50 px-2.5 py-1 text-[11px] font-bold text-brand-700 ring-1 ring-inset ring-brand-200 dark:bg-brand-500/10 dark:text-brand-300 dark:ring-brand-500/20">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-400 opacity-70" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-brand-500" />
              </span>
              Realtime
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={toggleSound}
              aria-pressed={soundEnabled}
            >
              {soundEnabled ? <Bell className="h-4 w-4" /> : <BellOff className="h-4 w-4" />}
              <span className="hidden sm:inline">
                Suara {soundEnabled ? 'aktif' : 'mati'}
              </span>
            </Button>
          </>
        }
      />

      {error && <Alert tone="error">{error}</Alert>}
      {actionError && <Alert tone="error">{actionError}</Alert>}
      {actionInfo && <Alert tone="success">{actionInfo}</Alert>}

      <section aria-labelledby="pending-title" className="space-y-3">
        <div>
          <h2
            id="pending-title"
            className="flex items-center gap-2 text-lg font-extrabold tracking-tight text-slate-900 dark:text-white"
          >
            Menunggu verifikasi
            {pending.length > 0 && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-extrabold text-amber-700 dark:bg-amber-400/15 dark:text-amber-300">
                {pending.length}
              </span>
            )}
          </h2>
          <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
            Booking yang perlu keputusanmu. Slot terkunci sampai diterima, ditolak, atau
            kadaluarsa.
          </p>
        </div>

        {pending.length === 0 ? (
          <EmptyState
            icon={<CircleCheck className="h-5 w-5" />}
            title="Tidak ada yang menunggu"
            description="Semua permintaan sudah diproses. Booking baru akan muncul otomatis di sini."
            className="py-9"
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {pending.map((booking) => (
              <PendingBookingCard
                key={booking.id}
                booking={booking}
                nowMs={now.getTime()}
                busy={busyId === booking.id}
                onAccept={() => void handleAccept(booking)}
                onReject={() => openReject(booking)}
              />
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white">
              Operasional harian
            </h2>
            <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
              {formatDateLong(date)} · {relativeDayLabel(date)}
            </p>
          </div>
          <DateNav value={date} onChange={setDate} />
        </div>

        <RecapGrid bookings={dayBookings} />

        <Card className="overflow-hidden">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 dark:border-slate-800">
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Booking {relativeDayLabel(date).toLowerCase()}
            </h3>
            <span className="text-xs font-semibold text-slate-400">
              {dayBookings.length} entri
            </span>
          </div>

          {dayBookings.length === 0 ? (
            <p className="px-4 py-9 text-center text-sm text-slate-400">
              Belum ada booking pada tanggal ini.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 dark:divide-slate-800">
              {dayBookings.map((booking) => (
                <li
                  key={booking.id}
                  className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center"
                >
                  <div className="w-16 shrink-0">
                    <p className="text-sm font-extrabold tabular-nums text-slate-800 dark:text-slate-100">
                      {formatHour(booking.startHour)}
                    </p>
                    <p className="text-[10px] text-slate-400">{booking.duration} jam</p>
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <p className="truncate text-sm font-bold text-slate-800 dark:text-slate-100">
                        {booking.userName}
                      </p>
                      <span className="font-mono text-[9px] text-slate-400">
                        {bookingCode(booking.id)}
                      </span>
                    </div>
                    <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                      {formatTimeRange(booking.startHour, booking.duration)} WIB · Kok{' '}
                      {booking.shuttlecocks ?? '-'} · Raket {booking.rackets ?? '-'}
                      {booking.note ? ` · ${booking.note}` : ''}
                    </p>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <span className="text-xs font-extrabold text-slate-700 dark:text-slate-200">
                      {formatCurrency(bookingPrice(booking))}
                    </span>
                    <BookingStatusBadge status={booking.status} />
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Tutup / buka slot manual
              </h3>
              <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                Slot yang ditutup tidak bisa dipesan user sampai dibuka kembali.
              </p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-500 dark:bg-slate-800 dark:text-slate-400">
              {formatDateLong(date)}
            </span>
          </div>

          <div className="mt-4">
            <SlotControl
              schedule={schedule}
              busyHour={busyHour}
              onToggle={(hour, closed) => void handleToggleSlot(hour, closed)}
            />
          </div>
        </Card>
      </section>

      {alertBooking && (
        <div className="fixed bottom-24 right-4 z-50 w-[calc(100%-2rem)] max-w-sm animate-slide-up sm:bottom-6">
          <div className="rounded-2xl border border-brand-200 bg-white p-4 shadow-xl shadow-slate-900/10 dark:border-brand-500/30 dark:bg-slate-900">
            <div className="flex items-start gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-brand-100 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">
                <Bell className="h-4 w-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">
                  Booking baru masuk
                </p>
                <p className="mt-0.5 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                  {alertBooking.userName} · {formatDateLong(alertBooking.date)} ·{' '}
                  {formatTimeRange(alertBooking.startHour, alertBooking.duration)} WIB
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAlertBooking(null)}
                aria-label="Tutup notifikasi"
                className="-mr-1 -mt-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <Modal
        open={rejectTarget !== null}
        onClose={() => {
          if (!rejecting) setRejectTarget(null);
        }}
        title="Tolak booking?"
        description="Slot akan langsung tersedia kembali untuk pengguna lain."
        icon={<X className="h-5 w-5" />}
      >
        <form onSubmit={handleReject} className="space-y-4">
          {rejectTarget && (
            <div className="rounded-xl bg-slate-50 p-3 text-sm dark:bg-slate-950/40">
              <p className="font-bold text-slate-800 dark:text-slate-100">
                {rejectTarget.userName}
              </p>
              <p className="mt-0.5 text-slate-500 dark:text-slate-400">
                {formatDateLong(rejectTarget.date)} ·{' '}
                {formatTimeRange(rejectTarget.startHour, rejectTarget.duration)} WIB
              </p>
              <p className="mt-1 font-mono text-[10px] text-slate-400">
                {bookingCode(rejectTarget.id)}
              </p>
            </div>
          )}

          <FormField
            label="Alasan penolakan"
            htmlFor="reject-reason"
            optional
            hint={`${rejectReason.length}/200`}
          >
            <textarea
              id="reject-reason"
              rows={3}
              maxLength={200}
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
              placeholder="Contoh: slot dipakai turnamen internal."
              className={textareaClasses}
            />
          </FormField>

          {rejectError && <Alert tone="error">{rejectError}</Alert>}

          <div className="flex flex-col-reverse gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setRejectTarget(null)}
              disabled={rejecting}
              className="sm:flex-1"
            >
              Kembali
            </Button>
            <Button
              type="submit"
              variant="danger"
              disabled={rejecting}
              className="sm:flex-1"
            >
              {rejecting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <X className="h-4 w-4" />
              )}
              {rejecting ? 'Memproses...' : 'Tolak booking'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
