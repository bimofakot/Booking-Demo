import { ChevronRight } from 'lucide-react';
import type { DaySchedule } from '@/types';
import { useNow } from '@/hooks/useNow';
import {
  currentWibHour,
  formatHour,
  formatTimeRange,
  isSlotInPast,
  todayWIB,
} from '@/lib/datetime';
import { formatCurrency } from '@/lib/format';
import { PRICE_PER_HOUR } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { SlotStatusBadge } from '@/components/ui/Badge';

function LegendDot({ className, label }: { className: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={cn('h-2 w-2 rounded-full', className)} />
      {label}
    </span>
  );
}

interface SlotListProps {
  schedule: DaySchedule;
  onSelect: (hour: number) => void;
}

export function SlotList({ schedule, onSelect }: SlotListProps) {
  const now = useNow(30_000);
  const today = todayWIB(now);
  const currentHour = currentWibHour(now);

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-semibold text-slate-500 dark:text-slate-400">
        <LegendDot className="bg-emerald-500" label="Tersedia" />
        <LegendDot className="bg-amber-500" label="Menunggu verifikasi" />
        <LegendDot className="bg-rose-500" label="Terbooking" />
        <LegendDot className="bg-slate-400" label="Ditutup" />
      </div>

      <ul className="space-y-2">
        {schedule.slots.map((slot) => {
          const past = isSlotInPast(schedule.date, slot.hour, now);
          const isCurrent = schedule.date === today && slot.hour === currentHour;
          const isAvailable = slot.status === 'available' && !past;

          const tone = past
            ? 'border-slate-200 bg-slate-50/80 text-slate-400 dark:border-slate-800 dark:bg-slate-900/40 dark:text-slate-500'
            : slot.status === 'available'
              ? 'border-brand-200 bg-brand-50/60 text-slate-900 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-slate-100'
              : slot.status === 'pending'
                ? 'border-amber-200 bg-amber-50/60 text-slate-900 dark:border-amber-500/25 dark:bg-amber-500/10 dark:text-slate-100'
                : slot.status === 'booked'
                  ? 'border-rose-200 bg-rose-50/60 text-slate-900 dark:border-rose-500/25 dark:bg-rose-500/10 dark:text-slate-100'
                  : 'border-slate-200 bg-slate-100/70 text-slate-500 dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-400';

          const bar = past
            ? 'bg-slate-300 dark:bg-slate-700'
            : slot.status === 'available'
              ? 'bg-brand-500'
              : slot.status === 'pending'
                ? 'bg-amber-500'
                : slot.status === 'booked'
                  ? 'bg-rose-500'
                  : 'bg-slate-400';

          return (
            <li key={slot.hour}>
              <button
                type="button"
                disabled={!isAvailable}
                onClick={() => onSelect(slot.hour)}
                className={cn(
                  'group flex w-full items-center gap-3 rounded-2xl border px-3.5 py-3 text-left transition sm:gap-4 sm:px-4',
                  tone,
                  isAvailable &&
                    'cursor-pointer hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md active:translate-y-0 dark:hover:border-brand-500/50',
                )}
              >
                <span className="w-14 shrink-0 text-base font-extrabold tabular-nums">
                  {formatHour(slot.hour)}
                </span>
                <span className={cn('h-9 w-1 shrink-0 rounded-full', bar)} />
                <span className="min-w-0 flex-1">
                  <span className="flex flex-wrap items-center gap-2">
                    {past ? (
                      <span className="text-sm font-bold">Sudah lewat</span>
                    ) : (
                      <SlotStatusBadge status={slot.status} />
                    )}
                    {isCurrent && (
                      <span className="rounded-full bg-slate-900/5 px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wide text-slate-500 dark:bg-white/10 dark:text-slate-300">
                        Sekarang
                      </span>
                    )}
                  </span>
                  <span className="mt-1 block text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    {formatTimeRange(slot.hour, 1)} WIB · {formatCurrency(PRICE_PER_HOUR)}
                  </span>
                </span>

                {isAvailable ? (
                  <span className="flex shrink-0 items-center gap-0.5 rounded-full bg-brand-600 py-1.5 pl-3 pr-2 text-[11px] font-extrabold text-white shadow-sm transition group-hover:bg-brand-700">
                    Pesan
                    <ChevronRight className="h-3.5 w-3.5" />
                  </span>
                ) : (
                  <span className="w-10 shrink-0" />
                )}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
