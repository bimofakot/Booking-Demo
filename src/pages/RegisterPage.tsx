import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Loader2, UserPlus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Alert } from '@/components/ui/Alert';
import { Button } from '@/components/ui/Button';
import { FormField, inputClasses } from '@/components/ui/FormField';
import { AuthLayout } from '@/components/auth/AuthLayout';

const USERNAME_PATTERN = /^[a-z0-9_]{3,20}$/i;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface FieldErrors {
  username?: string;
  email?: string;
  password?: string;
  confirm?: string;
}

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (user) return <Navigate to="/" replace />;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const nextErrors: FieldErrors = {};
    if (!USERNAME_PATTERN.test(username.trim())) {
      nextErrors.username = 'Username 3–20 karakter, hanya huruf, angka, dan garis bawah.';
    }
    if (!EMAIL_PATTERN.test(email.trim())) {
      nextErrors.email = 'Format email tidak valid.';
    }
    if (password.length < 6) {
      nextErrors.password = 'Password minimal 6 karakter.';
    }
    if (password !== confirm) {
      nextErrors.confirm = 'Konfirmasi password belum sama.';
    }

    setFieldErrors(nextErrors);
    setError(null);
    if (Object.keys(nextErrors).length > 0) return;

    setSubmitting(true);
    try {
      await register({
        username: username.trim(),
        email: email.trim(),
        password,
      });
      navigate('/', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mendaftar. Coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthLayout
      title="Buat akun user"
      description="Satu akun untuk melihat jadwal dan mengajukan booking."
      footer={
        <>
          Sudah punya akun?{' '}
          <Link
            to="/login"
            className="font-bold text-brand-700 hover:underline dark:text-brand-300"
          >
            Masuk
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField label="Username" htmlFor="username" error={fieldErrors.username}>
          <input
            id="username"
            name="username"
            autoComplete="username"
            autoFocus
            required
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="mis. andi_01"
            className={inputClasses}
          />
        </FormField>

        <FormField
          label="Email"
          htmlFor="email"
          error={fieldErrors.email}
          hint="Email asli, belum diverifikasi pada mode demo"
        >
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="nama@email.com"
            className={inputClasses}
          />
        </FormField>

        <FormField label="Password" htmlFor="password" error={fieldErrors.password}>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={6}
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Minimal 6 karakter"
            className={inputClasses}
          />
        </FormField>

        <FormField label="Konfirmasi password" htmlFor="confirm" error={fieldErrors.confirm}>
          <input
            id="confirm"
            name="confirm"
            type="password"
            autoComplete="new-password"
            required
            value={confirm}
            onChange={(event) => setConfirm(event.target.value)}
            placeholder="Ulangi password"
            className={inputClasses}
          />
        </FormField>

        {error && <Alert tone="error">{error}</Alert>}

        <Button type="submit" size="lg" disabled={submitting} className="w-full">
          {submitting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <UserPlus className="h-4 w-4" />
          )}
          {submitting ? 'Membuat akun...' : 'Daftar & masuk'}
        </Button>

        <p className="rounded-xl bg-slate-50 px-3 py-2.5 text-[11px] leading-relaxed text-slate-500 dark:bg-slate-950/40 dark:text-slate-400">
          Pendaftaran ini hanya membuat akun user. Akun owner tidak dapat dibuat dari halaman
          ini.
        </p>
      </form>
    </AuthLayout>
  );
}
