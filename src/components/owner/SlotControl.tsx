import type { DaySchedule } from '@/types';
import { useNow } from '@/hooks/useNow';
import { formatHour, isSlotInPast } from '@/lib/datetime';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/Button';
import { SlotStatusBadge } from '@/components/ui/Badge';

interface SlotControlProps {
  schedule: DaySchedule | null;
  busyHour: number | null;
  onToggle: (hour: number, closed: boolean) => void;
}

export function SlotControl({ schedule, busyHour, onToggle }: SlotControlProps) {
  const now = useNow(30_000);

  if (!schedule) {
    return <p className="text-sm text-slate-400">Jadwal belum siap.</p>;
  }

  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {schedule.slots.map((slot) => {
        const past = isSlotInPast(schedule.date, slot.hour, now);
        const canToggle = (slot.status === 'available' || slot.status === 'closed') && !past;
        const busy = busyHour === slot.hour;

        return (
          <div
            key={slot.hour}
            className={cn(
              'flex items-center justify-between gap-2 rounded-xl border px-3 py-2',
              slot.status === 'closed'
                ? 'border-slate-200 bg-slate-100/70 dark:border-slate-800 dark:bg-slate-950/40'
                : 'border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900',
              past && 'opacity-60',
            )}
          >
            <div className="flex min-w-0 items-center gap-2">
              <span className="w-11 shrink-0 text-sm font-extrabold tabular-nums text-slate-700 dark:text-slate-200">
                {formatHour(slot.hour)}
              </span>
              <SlotStatusBadge status={slot.status} />
            </div>

            {canToggle ? (
              <Button
                size="sm"
                variant={slot.status === 'closed' ? 'secondary' : 'outline'}
                onClick={() => onToggle(slot.hour, slot.status !== 'closed')}
                disabled={busy}
                className="h-8 px-2.5"
              >
                {slot.status === 'closed' ? 'Buka' : 'Tutup'}
              </Button>
            ) : (
              <span className="text-[10px] font-semibold text-slate-400">
                {past ? 'Lewat' : 'Terisi'}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}
