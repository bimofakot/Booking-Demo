import { useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { VENUE_NAME } from '@/lib/constants';
import { BottomNav } from './BottomNav';
import { Header } from './Header';

export function AppLayout() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="flex min-h-dvh flex-col bg-court">
      <Header />
      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-28 pt-5 sm:px-6 sm:pb-12 sm:pt-8">
        <Outlet />
      </main>
      <footer className="mx-auto w-full max-w-5xl px-4 pb-24 text-center text-[11px] leading-relaxed text-slate-400 sm:px-6 sm:pb-8 dark:text-slate-500">
        <p className="font-semibold text-slate-500 dark:text-slate-400">
          {VENUE_NAME} · WIB (Asia/Jakarta)
        </p>
        <p className="mt-0.5">Aplikasi demo lokal — data tersimpan di browser Anda.</p>
      </footer>
      <BottomNav />
    </div>
  );
}
