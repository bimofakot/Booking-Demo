import { Loader2 } from 'lucide-react';

export function LoadingState({ label = 'Memuat data...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-sm font-medium text-slate-500 dark:text-slate-400">
      <Loader2 className="h-6 w-6 animate-spin text-brand-600 dark:text-brand-400" />
      {label}
    </div>
  );
}
