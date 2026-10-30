import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export const inputClasses =
  'block w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 shadow-sm transition placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-brand-400';

export const textareaClasses = cn(inputClasses, 'min-h-24 resize-none');

interface FormFieldProps {
  label: string;
  htmlFor: string;
  hint?: string;
  error?: string;
  optional?: boolean;
  children: ReactNode;
  className?: string;
}

export function FormField({
  label,
  htmlFor,
  hint,
  error,
  optional,
  children,
  className,
}: FormFieldProps) {
  return (
    <div className={cn('space-y-1.5', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <label
          htmlFor={htmlFor}
          className="text-sm font-semibold text-slate-700 dark:text-slate-200"
        >
          {label}
          {optional && (
            <span className="ml-1 text-xs font-medium text-slate-400">(opsional)</span>
          )}
        </label>
        {hint && <span className="text-[11px] font-medium text-slate-400">{hint}</span>}
      </div>
      {children}
      {error && (
        <p className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>
      )}
    </div>
  );
}
