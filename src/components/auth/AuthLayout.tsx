import type { ReactNode } from 'react';
import { Card } from '@/components/ui/Card';
import { Logo } from '@/components/ui/Logo';

interface AuthLayoutProps {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
}

export function AuthLayout({ title, description, children, footer }: AuthLayoutProps) {
  return (
    <div className="mx-auto w-full max-w-md">
      <div className="mb-6 flex justify-center">
        <Logo />
      </div>
      <Card className="overflow-hidden">
        <div className="border-b border-slate-100 bg-gradient-to-br from-brand-50 via-white to-white px-6 py-5 dark:border-slate-800 dark:from-brand-500/10 dark:via-slate-900 dark:to-slate-900">
          <h1 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {title}
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{description}</p>
        </div>
        <div className="p-6">{children}</div>
      </Card>
      {footer && (
        <div className="mt-4 text-center text-sm text-slate-500 dark:text-slate-400">
          {footer}
        </div>
      )}
    </div>
  );
}
