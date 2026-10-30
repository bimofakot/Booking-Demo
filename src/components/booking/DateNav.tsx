import { CalendarDays } from 'lucide-react';
import { addDays, todayWIB } from '@/lib/datetime';
import { cn } from '@/lib/cn';

interface DateNavProps {
  value: string;
  onChange: (date: string) => void;
  className?: string;
}

export function DateNav({ value, onChange, className }: DateNavProps) {
  const today = todayWIB();
  const quickOptions = [
    { label: 'Kemarin', value: addDays(today, -1) },
    { label: 'Hari ini', value: today },
    { label: 'Besok', value: addDays(today, 1) },
  ];

  return (
    <div className={cn('flex flex-col gap-2 sm:flex-row sm:items-center', className)}>
      <div className="grid flex-1 grid-cols-3 gap-1 rounded-2xl border border-slate-200 bg-white p-1 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        {quickOptions.map((option) => (
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={cn(
              'rounded-xl px-3 py-2 text-sm font-semibold transition',
              value === option.value
                ? 'bg-brand-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800',
            )}
          >
            {option.label}
          </button>
        ))}
      </div>

      <label className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-2 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />
        <span className="sr-only">Pilih tanggal</span>
        <input
          type="date"
          value={value}
          onChange={(event) => {
            if (event.target.value) onChange(event.target.value);
          }}
          className="w-full bg-transparent text-sm font-semibold text-slate-700 outline-none dark:text-slate-200 sm:w-36"
        />
      </label>
    </div>
  );
}
