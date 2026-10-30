import { Link } from 'react-router-dom';
import { VENUE_NAME } from '@/lib/constants';
import { cn } from '@/lib/cn';
import { ShuttleIcon } from './ShuttleIcon';

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      to="/"
      aria-label={`${VENUE_NAME} — beranda`}
      className={cn(
        'flex items-center gap-2.5 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500',
        className,
      )}
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-emerald-500 text-white shadow-md shadow-brand-600/25">
        <ShuttleIcon className="h-5 w-5" />
      </span>
      <span className="leading-tight">
        <span className="block text-sm font-extrabold tracking-tight text-slate-900 dark:text-white">
          {VENUE_NAME}
        </span>
        <span className="block text-[11px] font-semibold text-slate-500 dark:text-slate-400">
          Booking lapangan
        </span>
      </span>
    </Link>
  );
}
