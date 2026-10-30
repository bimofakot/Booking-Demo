import type { ReactNode } from 'react';
import { CircleAlert, CircleCheck, Info, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';

export type AlertTone = 'error' | 'success' | 'info' | 'warning';

const config: Record<
  AlertTone,
  { wrapper: string; icon: typeof CircleAlert; iconClass: string }
> = {
  error: {
    wrapper:
      'border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200',
    icon: CircleAlert,
    iconClass: 'text-rose-500 dark:text-rose-400',
  },
  success: {
    wrapper:
      'border-brand-200 bg-brand-50 text-brand-800 dark:border-brand-500/30 dark:bg-brand-500/10 dark:text-brand-200',
    icon: CircleCheck,
    iconClass: 'text-brand-600 dark:text-brand-400',
  },
  info: {
    wrapper:
      'border-sky-200 bg-sky-50 text-sky-800 dark:border-sky-500/30 dark:bg-sky-500/10 dark:text-sky-200',
    icon: Info,
    iconClass: 'text-sky-500 dark:text-sky-400',
  },
  warning: {
    wrapper:
      'border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200',
    icon: TriangleAlert,
    iconClass: 'text-amber-500 dark:text-amber-400',
  },
};

interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: ReactNode;
  className?: string;
}

export function Alert({ tone = 'info', title, children, className }: AlertProps) {
  const { wrapper, icon: Icon, iconClass } = config[tone];

  return (
    <div
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn(
        'flex items-start gap-2.5 rounded-xl border px-3.5 py-3 text-sm',
        wrapper,
        className,
      )}
    >
      <Icon className={cn('mt-0.5 h-4 w-4 shrink-0', iconClass)} />
      <div className="min-w-0 flex-1 leading-relaxed">
        {title && <p className="font-bold">{title}</p>}
        {children}
      </div>
    </div>
  );
}
