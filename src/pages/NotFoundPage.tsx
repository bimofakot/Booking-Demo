import { Link } from 'react-router-dom';
import { CalendarDays, Compass } from 'lucide-react';
import { buttonClasses } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

export default function NotFoundPage() {
  return (
    <Card className="mx-auto max-w-lg p-8 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-brand-50 text-brand-700 dark:bg-brand-500/10 dark:text-brand-300">
        <Compass className="h-6 w-6" />
      </span>
      <p className="mt-4 text-[11px] font-extrabold uppercase tracking-[0.16em] text-slate-400">
        Error 404
      </p>
      <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
        Halaman tidak ditemukan
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-slate-500 dark:text-slate-400">
        Alamat yang kamu buka tidak tersedia. Kembali ke jadwal untuk melihat slot yang masih
        kosong.
      </p>
      <Link
        to="/"
        className={buttonClasses({ size: 'md', className: 'mt-5 inline-flex' })}
      >
        <CalendarDays className="h-4 w-4" />
        Kembali ke jadwal
      </Link>
    </Card>
  );
}
