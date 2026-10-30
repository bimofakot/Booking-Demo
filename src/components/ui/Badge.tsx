import type { BookingStatus, SlotStatus } from '@/types';
import { BOOKING_STATUS_LABEL, SLOT_STATUS_LABEL } from '@/lib/labels';
import { cn } from '@/lib/cn';

const base =
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold leading-none whitespace-nowrap';

const bookingStyles: Record<BookingStatus, { wrapper: string; dot: string }> = {
  pending: {
    wrapper:
      'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20',
    dot: 'bg-amber-500',
  },
  confirmed: {
    wrapper:
      'bg-brand-50 text-brand-700 ring-1 ring-inset ring-brand-200 dark:bg-brand-400/10 dark:text-brand-300 dark:ring-brand-400/20',
    dot: 'bg-brand-500',
  },
  rejected: {
    wrapper:
      'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20',
    dot: 'bg-rose-500',
  },
  cancelled: {
    wrapper:
      'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
    dot: 'bg-slate-400',
  },
  expired: {
    wrapper:
      'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
    dot: 'bg-slate-400',
  },
};

const slotStyles: Record<SlotStatus, { wrapper: string; dot: string }> = {
  available: {
    wrapper:
      'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-200 dark:bg-emerald-400/10 dark:text-emerald-300 dark:ring-emerald-400/20',
    dot: 'bg-emerald-500',
  },
  pending: {
    wrapper:
      'bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-200 dark:bg-amber-400/10 dark:text-amber-300 dark:ring-amber-400/20',
    dot: 'bg-amber-500',
  },
  booked: {
    wrapper:
      'bg-rose-50 text-rose-700 ring-1 ring-inset ring-rose-200 dark:bg-rose-400/10 dark:text-rose-300 dark:ring-rose-400/20',
    dot: 'bg-rose-500',
  },
  closed: {
    wrapper:
      'bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700',
    dot: 'bg-slate-400',
  },
};

export function BookingStatusBadge({
  status,
  className,
}: {
  status: BookingStatus;
  className?: string;
}) {
  const styles = bookingStyles[status];
  return (
    <span className={cn(base, styles.wrapper, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', styles.dot)} />
      {BOOKING_STATUS_LABEL[status]}
    </span>
  );
}

export function SlotStatusBadge({
  status,
  className,
}: {
  status: SlotStatus;
  className?: string;
}) {
  const styles = slotStyles[status];
  return (
    <span className={cn(base, styles.wrapper, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', styles.dot)} />
      {SLOT_STATUS_LABEL[status]}
    </span>
  );
}
