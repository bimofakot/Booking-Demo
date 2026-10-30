import { useState, type FormEvent } from 'react';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Loader2, LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FormField, inputClasses } from '@/components/ui/FormField';
import { AuthLayout } from '@/components/auth/AuthLayout';
import { cn } from '@/lib/cn';

interface LoginLocationState {
  from?: string;
  message?: string;
}

export default function LoginPage() {
  const { user, login } = useAuth();
  const location = useLocation();
  const state = (location.state ?? null) as LoginLocationState | null;
  const redirectTo = state?.from && state.from.startsWith('/') ? state.from : '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to={redirectTo} replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;
    setError(null);
    setSubmitting(true);

    try {
      await login(username.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal masuk. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  function fillDemo(value: string, secret: string) {
    setUsername(value);
    setPassword(secret);
    setError(null);
  }

  return (
    <AuthLayout
      title="Masuk ke akun"
      description="Gunakan username dan password untuk melanjutkan."
      footer={
        <>
          Belum punya akun?{' '}
          <Link
            to="/daftar"
            className="font-bold text-brand-700 hover:underline dark:text-brand-300"
          >
            Daftar sekarang
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {state?.message && <Alert tone="info">{state.message}</Alert>}

        <FormField label="Username" htmlFor="username">
          <input
            id="username"
            name="username"
            autoComplete="username"
            autoFocus
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="mis. budi"
            className={inputClasses}
          />
        </FormField>

        <FormField label="Password" htmlFor="password">
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="••••••"
              className={cn(inputClasses, 'pr-11')}
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              aria-label={showPassword ? 'Sembunyikan password' : 'Tampilkan password'}
              className="absolute right-1.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-200"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
        </FormField>

        {error && <Alert tone="error">{error}</Alert>}

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
          {submitting ? 'Memproses...' : 'Masuk'}
        </Button>

        <div className="flex items-center justify-between text-xs">
          <Link
            to="/lupa-password"
            className="font-semibold text-slate-500 hover:text-brand-700 dark:text-slate-400 dark:hover:text-brand-300"
          >
            Lupa password?
          </Link>
          <span className="text-slate-400">Zona waktu WIB</span>
        </div>
      </form>

      <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-950/40">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-400">
          Akun demo
        </p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => fillDemo('owner', 'owner123')}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left transition hover:border-brand-300 hover:bg-brand-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/10"
          >
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-200">
              Owner
            </span>
            <span className="block text-[10px] text-slate-400">owner / owner123</span>
          </button>
          <button
            type="button"
            onClick={() => fillDemo('budi', 'budi123')}
            className="rounded-lg border border-slate-200 bg-white px-2.5 py-2 text-left transition hover:border-brand-300 hover:bg-brand-50/50 dark:border-slate-700 dark:bg-slate-900 dark:hover:border-brand-500/40 dark:hover:bg-brand-500/10"
          >
            <span className="block text-xs font-bold text-slate-700 dark:text-slate-200">User</span>
            <span className="block text-[10px] text-slate-400">budi / budi123</span>
          </button>
        </div>
        <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
          Klik kartu untuk mengisi otomatis. Ini akun demo lokal, tidak untuk produksi.
        </p>
      </div>
    </AuthLayout>
  );
}
