// Tombol tunggal untuk menukar tema terang/gelap.
// Preferensi "ikut perangkat" tetap jadi default dan bisa dikembalikan dari menu akun.
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export function ThemeToggle() {
  const { resolvedTheme, setPreference } = useTheme();
  const nextTheme = resolvedTheme === 'dark' ? 'light' : 'dark';
  const label = `Aktifkan mode ${nextTheme === 'dark' ? 'gelap' : 'terang'}`;

  return (
    <button
      type="button"
      onClick={() => setPreference(nextTheme)}
      aria-label={label}
      title={label}
      className="grid h-11 w-11 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"
    >
      {resolvedTheme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
