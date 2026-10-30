import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowRight,
  CalendarDays,
  Clock,
  LayoutDashboard,
  LockKeyhole,
  Wallet,
} from 'lucide-react';
import type { SlotStatus } from '@/types';
import { useAuth } from '@/context/AuthContext';
import { useNow } from '@/hooks/useNow';
import { useSchedule } from '@/hooks/useSchedule';
import {
  formatDateLong,
  isSlotInPast,
  isValidDateString,
  relativeDayLabel,
  todayWIB,
} from '@/lib/datetime';
import { formatCurrency } from '@/lib/format';
import { PRICE_PER_HOUR } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { Alert } from '@/components/ui/Alert';
import { Card } from '@/components/ui/Card';
import { ShuttleIcon } from '@/components/ui/ShuttleIcon';
import { BookingDialog } from '@/components/booking/BookingDialog';
import { DateNav } from '@/components/booking/DateNav';
import { SlotList } from '@/components/booking/SlotList';

const steps = [
  {
    icon: CalendarDays,
    title: 'Pilih jam hijau',
    description: 'Slot tersedia bisa langsung diajukan, termasuk beberapa jam sekaligus.',
  },
  {
    icon: Clock,
    title: 'Tunggu verifikasi',
    description: 'Owner menerima atau menolak. Slot terkunci maksimal 3 jam.',
  },
  {
    icon: Wallet,
    title: 'Datang & bayar',
    description: 'Tanpa DP. Bayar di tempat sesuai durasi yang dipesan.',
  },
];

function SlotSkeleton() {
  return (
    <div className="mt-5 space-y-2" aria-hidden="true">
      {Array.from({ length: 7 }, (_, index) => (
        <div
          key={index}
          className="h-16 animate-pulse rounded-2xl bg-slate-100 dark:bg-slate-800/70"
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const now = useNow(30_000);
  const today = todayWIB(now);

  const [date, setDate] = useState(() => {
    const fromQuery = searchParams.get('date');
    return fromQuery && isValidDateString(fromQuery) ? fromQuery : todayWIB();
  });
  const [selectedHour, setSelectedHour] = useState<number | null>(null);

  const { schedule, loading, error } = useSchedule(date);
  const { schedule: todaySchedule } = useSchedule(today);

  const todaySummary = useMemo(() => {
    if (!todaySchedule) return null;
    const counts: Record<SlotStatus, number> = {
      available: 0,
      pending: 0,
      booked: 0,
      closed: 0,
    };
    const bookingIds = new Set<string>();

    todaySchedule.slots.forEach((slot) => {
      counts[slot.status] += 1;
      if (slot.bookingId) bookingIds.add(slot.bookingId);
    });

    return {
      ...counts,
      occupied: counts.pending + counts.booked,
      bookingCount: bookingIds.size,
      remainingAvailable: todaySchedule.slots.filter(
        (slot) => slot.status === 'available' && !isSlotInPast(today, slot.hour, now),
      ).length,
    };
  }, [todaySchedule, today, now]);

  function handleSelect(hour: number) {
    if (!user) {
      navigate('/login', {
        state: {
          from: `/?date=${date}`,
          message: 'Silakan masuk dulu untuk memesan lapangan.',
        },
      });
      return;
    }
    setSelectedHour(hour);
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-800 via-brand-700 to-emerald-600 p-5 text-white shadow-xl shadow-brand-900/20 sm:p-8">
        <ShuttleIcon className="pointer-events-none absolute -right-8 -top-10 h-52 w-52 rotate-12 text-white/[0.06]" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-52 w-52 rounded-full border-[18px] border-white/[0.06]" />

        <div className="relative">
          <p className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-[0.2em] text-white/70">
            <ShuttleIcon className="h-4 w-4" />
            Jadwal lapangan
          </p>
          <h1 className="mt-2 max-w-xl text-2xl font-extrabold leading-tight tracking-tight sm:text-4xl">
            Satu lapangan, jadwal yang jelas.
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/75 sm:text-base">
            Cek slot 07.00–21.00 WIB, ajukan booking, lalu bayar di tempat setelah owner
            memverifikasi.
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1.5 text-[11px] font-bold backdrop-blur">
              <span
                className={cn(
                  'h-2 w-2 rounded-full',
                  todaySummary?.occupied ? 'bg-amber-300' : 'bg-emerald-300',
                )}
              />
              {todaySummary
                ? todaySummary.bookingCount > 0
                  ? `Ada ${todaySummary.bookingCount} booking hari ini`
                  : 'Belum ada booking hari ini'
                : 'Memuat ringkasan hari ini...'}
            </span>
            {todaySummary && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/85">
                {todaySummary.remainingAvailable} slot tersedia
              </span>
            )}
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/85">
              07.00–21.00 WIB
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white/85">
              {formatCurrency(PRICE_PER_HOUR)} / jam
            </span>
          </div>

          {user?.role === 'owner' && (
            <Link
              to="/owner"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-sm font-bold text-brand-800 shadow-sm transition hover:bg-brand-50"
            >
              <LayoutDashboard className="h-4 w-4" />
              Buka dashboard owner
              <ArrowRight className="h-4 w-4" />
            </Link>
          )}
        </div>
      </section>

      <section aria-labelledby="jadwal-title">
        <Card className="p-4 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2
                id="jadwal-title"
                className="text-lg font-extrabold tracking-tight text-slate-900 dark:text-white"
              >
                Jadwal {relativeDayLabel(date, today).toLowerCase()}
              </h2>
              <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
                {formatDateLong(date)}
              </p>
            </div>
            <div className="text-right text-[11px] leading-relaxed text-slate-400">
              <p>1 lapangan</p>
              <p className="font-semibold text-slate-500 dark:text-slate-400">Bayar di tempat</p>
            </div>
          </div>

          <DateNav value={date} onChange={setDate} className="mt-4" />

          {loading ? (
            <SlotSkeleton />
          ) : error ? (
            <Alert tone="error" className="mt-4">
              {error}
            </Alert>
          ) : schedule ? (
            <div className="mt-5">
              <SlotList schedule={schedule} onSelect={handleSelect} />
            </div>
          ) : null}

          {!user && (
            <p className="mt-4 flex items-start gap-2 rounded-xl bg-slate-50 px-3 py-2.5 text-xs leading-relaxed text-slate-500 dark:bg-slate-950/40 dark:text-slate-400">
              <LockKeyhole className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>
                Kamu bisa melihat jadwal tanpa masuk. Untuk memesan, silakan{' '}
                <Link
                  to="/login"
                  state={{
                    from: `/?date=${date}`,
                    message: 'Silakan masuk dulu untuk memesan lapangan.',
                  }}
                  className="font-bold text-brand-700 underline-offset-2 hover:underline dark:text-brand-300"
                >
                  masuk
                </Link>{' '}
                atau{' '}
                <Link
                  to="/daftar"
                  className="font-bold text-brand-700 underline-offset-2 hover:underline dark:text-brand-300"
                >
                  daftar
                </Link>
                .
              </span>
            </p>
          )}
        </Card>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        {steps.map((step, index) => {
          const Icon = step.icon;
          return (
            <Card key={step.title} className="p-4">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
                  Langkah {index + 1}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-extrabold text-slate-900 dark:text-white">
                {step.title}
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                {step.description}
              </p>
            </Card>
          );
        })}
      </section>

      {selectedHour !== null && schedule && (
        <BookingDialog
          open
          date={date}
          startHour={selectedHour}
          schedule={schedule}
          onClose={() => setSelectedHour(null)}
        />
      )}
    </div>
  );
}
