import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarDays, Info, Loader2, Send } from 'lucide-react';
import type { DaySchedule } from '@/types';
import { bookingService } from '@/services';
import { CLOSE_HOUR, PRICE_PER_HOUR } from '@/lib/constants';
import { formatDateLong, formatTimeRange, isSlotInPast } from '@/lib/datetime';
import { formatCurrency } from '@/lib/format';
import { useNow } from '@/hooks/useNow';
import { cn } from '@/lib/cn';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FormField, inputClasses, textareaClasses } from '@/components/ui/FormField';
import { Modal } from '@/components/ui/Modal';

interface BookingDialogProps {
  open: boolean;
  date: string;
  startHour: number;
  schedule: DaySchedule;
  onClose: () => void;
}

export function BookingDialog({
  open,
  date,
  startHour,
  schedule,
  onClose,
}: BookingDialogProps) {
  const navigate = useNavigate();
  const now = useNow(30_000);
  const [duration, setDuration] = useState(1);
  const [shuttlecocks, setShuttlecocks] = useState('');
  const [rackets, setRackets] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!open) return;
    setDuration(1);
    setShuttlecocks('');
    setRackets('');
    setNote('');
    setError(null);
    setSubmitting(false);
  }, [open, date, startHour]);

  const maxDuration = useMemo(() => {
    let count = 0;
    for (let hour = startHour; hour < CLOSE_HOUR; hour += 1) {
      const slot = schedule.slots.find((item) => item.hour === hour);
      if (!slot || slot.status !== 'available' || isSlotInPast(date, hour, now)) break;
      count += 1;
    }
    return count;
  }, [schedule, startHour, date, now]);

  useEffect(() => {
    if (maxDuration > 0 && duration > maxDuration) setDuration(maxDuration);
  }, [maxDuration, duration]);

  const available = maxDuration > 0;
  const total = duration * PRICE_PER_HOUR;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError(null);

    if (!available) {
      setError('Slot ini sudah tidak tersedia. Silakan pilih jam lain.');
      return;
    }

    setSubmitting(true);
    try {
      const booking = await bookingService.createBooking({
        date,
        startHour,
        duration,
        shuttlecocks: shuttlecocks.trim() === '' ? undefined : Number(shuttlecocks),
        rackets: rackets.trim() === '' ? undefined : Number(rackets),
        note: note.trim() || undefined,
      });
      onClose();
      navigate(`/booking/sukses/${booking.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal membuat booking.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Pesan lapangan"
      description={`${formatDateLong(date)} · 1 lapangan`}
      icon={<CalendarDays className="h-5 w-5" />}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {!available && (
          <Alert tone="warning">
            Slot ini sudah tidak bisa dipesan. Tutup formulir dan pilih jam lain yang masih hijau.
          </Alert>
        )}

        <FormField label="Durasi" hint={`Maksimal ${maxDuration} jam`} htmlFor="duration-options">
          <div id="duration-options" className="grid grid-cols-4 gap-2 sm:grid-cols-6">
            {Array.from({ length: Math.max(maxDuration, 1) }, (_, index) => index + 1).map(
              (hour) => (
                <button
                  key={hour}
                  type="button"
                  disabled={hour > maxDuration}
                  onClick={() => setDuration(hour)}
                  className={cn(
                    'h-10 rounded-xl border text-xs font-bold transition',
                    duration === hour
                      ? 'border-brand-600 bg-brand-600 text-white shadow-sm'
                      : 'border-slate-200 bg-white text-slate-600 hover:border-brand-300 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300 dark:hover:border-brand-500/50',
                    hour > maxDuration && 'opacity-40',
                  )}
                >
                  {hour} jam
                </button>
              ),
            )}
          </div>
        </FormField>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Jumlah kok" htmlFor="shuttlecocks" optional>
            <input
              id="shuttlecocks"
              type="number"
              min={0}
              max={999}
              inputMode="numeric"
              placeholder="0"
              value={shuttlecocks}
              onChange={(event) => setShuttlecocks(event.target.value)}
              className={inputClasses}
            />
          </FormField>
          <FormField label="Jumlah raket" htmlFor="rackets" optional>
            <input
              id="rackets"
              type="number"
              min={0}
              max={999}
              inputMode="numeric"
              placeholder="0"
              value={rackets}
              onChange={(event) => setRackets(event.target.value)}
              className={inputClasses}
            />
          </FormField>
        </div>

        <FormField
          label="Catatan"
          htmlFor="note"
          optional
          hint={`${note.length}/300`}
        >
          <textarea
            id="note"
            rows={3}
            maxLength={300}
            placeholder="Contoh: butuh net tambahan, datang lebih awal."
            value={note}
            onChange={(event) => setNote(event.target.value)}
            className={textareaClasses}
          />
        </FormField>

        <div className="rounded-2xl border border-brand-100 bg-brand-50/60 p-4 dark:border-brand-500/20 dark:bg-brand-500/10">
          <div className="flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
            <span>Jadwal</span>
            <span className="font-bold text-slate-900 dark:text-white">
              {formatTimeRange(startHour, duration)} WIB
            </span>
          </div>
          <div className="mt-1 flex items-center justify-between text-sm text-slate-600 dark:text-slate-300">
            <span>Tarif</span>
            <span className="font-semibold">{formatCurrency(PRICE_PER_HOUR)} / jam</span>
          </div>
          <div className="mt-2 flex items-end justify-between border-t border-brand-200/60 pt-2 dark:border-brand-500/20">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
              Total bayar di tempat
            </span>
            <span className="text-lg font-extrabold tabular-nums text-brand-800 dark:text-brand-300">
              {formatCurrency(total)}
            </span>
          </div>
          <p className="mt-2 text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
            Biaya dihitung dari jam yang dibooking, bukan jam pemakaian.
          </p>
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="sm:flex-1"
          >
            Batal
          </Button>
          <Button
            type="submit"
            disabled={submitting || !available}
            className="sm:flex-[1.6]"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {submitting ? 'Mengirim...' : 'Kirim permintaan'}
          </Button>
        </div>

        <p className="flex items-start gap-1.5 text-[11px] leading-relaxed text-slate-400">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          Slot akan dikunci sementara (maksimal 3 jam) sampai owner memverifikasi.
        </p>
      </form>
    </Modal>
  );
}
